"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalFrontendApiCache = void 0;
const events_1 = __importDefault(require("events"));
const offline_unleash_client_1 = require("../playground/offline-unleash-client");
const constants_1 = require("../../util/constants");
const configuration_revision_service_1 = require("../feature-toggle/configuration-revision-service");
const metrics_helper_1 = __importDefault(require("../../util/metrics-helper"));
const metric_events_1 = require("../../metric-events");
class GlobalFrontendApiCache extends events_1.default {
    constructor(config, segmentReadModel, clientFeatureToggleReadModel, configurationRevisionService) {
        super();
        this.featuresByEnvironment = {};
        this.segments = [];
        this.status = 'starting';
        this.config = config;
        this.logger = config.getLogger('global-frontend-api-cache.ts');
        this.clientFeatureToggleReadModel = clientFeatureToggleReadModel;
        this.configurationRevisionService = configurationRevisionService;
        this.segmentReadModel = segmentReadModel;
        this.onUpdateRevisionEvent = this.onUpdateRevisionEvent.bind(this);
        this.timer = (functionName) => metrics_helper_1.default.wrapTimer(config.eventBus, metric_events_1.FUNCTION_TIME, {
            className: 'GlobalFrontendApiCache',
            functionName,
        });
        this.refreshData();
        this.configurationRevisionService.on(configuration_revision_service_1.UPDATE_REVISION, this.onUpdateRevisionEvent);
    }
    getSegment(id) {
        return this.segments.find((segment) => segment.id === id);
    }
    getToggle(name, token) {
        const features = this.getTogglesByEnvironment(this.environmentNameForToken(token));
        return features[name];
    }
    getToggles(token) {
        const features = this.getTogglesByEnvironment(this.environmentNameForToken(token));
        return this.filterTogglesByProjects(features, token.projects);
    }
    filterTogglesByProjects(features, projects) {
        if (projects.includes('*')) {
            return Object.values(features);
        }
        return Object.values(features).filter((feature) => feature.project && projects.includes(feature.project));
    }
    getTogglesByEnvironment(environment) {
        const features = this.featuresByEnvironment[environment];
        if (features == null)
            return {};
        return features;
    }
    // TODO: fetch only relevant projects/environments based on tokens
    async refreshData() {
        try {
            this.featuresByEnvironment = await this.getAllFeatures();
            this.segments = await this.getAllSegments();
            if (this.status === 'starting') {
                this.status = 'ready';
                this.emit('ready');
            }
            else if (this.status === 'ready' || this.status === 'updated') {
                this.status = 'updated';
                this.emit('updated');
            }
        }
        catch (e) {
            this.logger.error('Cannot load data for token', e);
        }
    }
    async getAllFeatures() {
        const features = await this.clientFeatureToggleReadModel.getAll();
        return this.mapFeatures(features);
    }
    async getAllSegments() {
        return (0, offline_unleash_client_1.mapSegmentsForClient)(await this.segmentReadModel.getAll());
    }
    async onUpdateRevisionEvent() {
        await this.refreshData();
    }
    environmentNameForToken(token) {
        if (token.environment === constants_1.ALL_ENVS) {
            return 'default';
        }
        return token.environment;
    }
    mapFeatures(features) {
        const entries = Object.entries(features).map(([key, value]) => [
            key,
            Object.fromEntries(Object.entries(value).map(([innerKey, innerValue]) => [
                innerKey,
                (0, offline_unleash_client_1.mapFeatureForClient)({
                    ...innerValue,
                    stale: innerValue.stale || false,
                }),
            ])),
        ]);
        return Object.fromEntries(entries);
    }
}
exports.GlobalFrontendApiCache = GlobalFrontendApiCache;
//# sourceMappingURL=global-frontend-api-cache.js.map