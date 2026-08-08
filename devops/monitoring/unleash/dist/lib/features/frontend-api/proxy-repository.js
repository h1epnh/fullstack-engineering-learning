"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyRepository = void 0;
const events_1 = __importDefault(require("events"));
const offline_unleash_client_1 = require("../playground/offline-unleash-client");
const constants_1 = require("../../util/constants");
const unleash_client_1 = require("unleash-client");
const configuration_revision_service_1 = require("../feature-toggle/configuration-revision-service");
const metric_events_1 = require("../../metric-events");
const metrics_helper_1 = __importDefault(require("../../util/metrics-helper"));
// TODO: remove after finished migration to global frontend api cache
class ProxyRepository extends events_1.default {
    constructor(config, stores, services, token) {
        super();
        this.config = config;
        this.logger = config.getLogger('proxy-repository.ts');
        this.stores = stores;
        this.services = services;
        this.configurationRevisionService =
            services.configurationRevisionService;
        this.token = token;
        this.onUpdateRevisionEvent = this.onUpdateRevisionEvent.bind(this);
        this.interval = config.frontendApi.refreshIntervalInMs;
        this.methodTimer = (functionName) => metrics_helper_1.default.wrapTimer(config.eventBus, metric_events_1.FUNCTION_TIME, {
            className: 'ProxyRepository',
            functionName,
        });
    }
    getTogglesWithSegmentData() {
        // TODO: add real implementation
        return [];
    }
    getSegment(id) {
        return this.segments.find((segment) => segment.id === id);
    }
    getToggle(name) {
        //@ts-ignore (we must update the node SDK to allow undefined)
        return this.features.find((feature) => feature.name === name);
    }
    getToggles() {
        return this.features;
    }
    async start() {
        this.running = true;
        await this.dataPolling();
        // Reload cached token data whenever something relevant has changed.
        // For now, simply reload all the data on any EventStore event.
        this.configurationRevisionService.on(configuration_revision_service_1.UPDATE_REVISION, this.onUpdateRevisionEvent);
        this.emit(unleash_client_1.UnleashEvents.Ready);
        this.emit(unleash_client_1.UnleashEvents.Changed);
    }
    stop() {
        this.configurationRevisionService.off(configuration_revision_service_1.UPDATE_REVISION, this.onUpdateRevisionEvent);
        this.running = false;
    }
    async dataPolling() {
        this.timer = setTimeout(async () => {
            if (!this.running) {
                clearTimeout(this.timer);
                this.timer = null;
                this.logger.debug('Shutting down data polling for proxy repository');
                return;
            }
            await this.dataPolling();
        }, this.randomizeDelay(this.interval, this.interval * 2)).unref();
        await this.loadDataForToken();
    }
    async loadDataForToken() {
        try {
            const stopTimer = this.methodTimer('loadDataForToken');
            this.features = await this.featuresForToken();
            this.segments = await this.segmentsForToken();
            stopTimer();
        }
        catch (e) {
            this.logger.error('Cannot load data for token', e);
        }
    }
    randomizeDelay(floor, ceiling) {
        return Math.floor(Math.random() * (ceiling - floor) + floor);
    }
    async onUpdateRevisionEvent() {
        await this.loadDataForToken();
    }
    async featuresForToken() {
        const start = Date.now();
        const mappedFeatures = await (0, offline_unleash_client_1.mapFeaturesForClient)(await this.services.featureToggleService.getClientFeatures({
            project: this.token.projects,
            environment: this.environmentNameForToken(),
        }));
        const duration = (Date.now() - start) / 1000;
        this.config.eventBus.emit(metric_events_1.PROXY_FEATURES_FOR_TOKEN_TIME, { duration });
        return mappedFeatures;
    }
    async segmentsForToken() {
        return (0, offline_unleash_client_1.mapSegmentsForClient)(await this.stores.segmentReadModel.getAll());
    }
    environmentNameForToken() {
        if (this.token.environment === constants_1.ALL_ENVS) {
            return 'default';
        }
        return this.token.environment;
    }
}
exports.ProxyRepository = ProxyRepository;
//# sourceMappingURL=proxy-repository.js.map