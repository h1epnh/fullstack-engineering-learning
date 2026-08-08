"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrontendApiService = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const unleash_client_1 = require("unleash-client");
const api_token_1 = require("../../types/models/api-token");
const frontend_settings_1 = require("../../types/settings/frontend-settings");
const util_1 = require("../../util");
const error_1 = require("../../error");
const metric_events_1 = require("../../metric-events");
const frontend_api_repository_1 = require("./frontend-api-repository");
class FrontendApiService {
    constructor(config, stores, services, globalFrontendApiCache) {
        /**
         * This is intentionally a Promise because we want to be able to await
         * until the client (which might be being created by a different request) is ready
         * Check this test that fails if we don't use a Promise: frontend-api.concurrency.e2e.test.ts
         */
        this.clients = new Map();
        this.config = config;
        this.logger = config.getLogger('services/frontend-api-service.ts');
        this.stores = stores;
        this.services = services;
        this.globalFrontendApiCache = globalFrontendApiCache;
    }
    async getFrontendApiFeatures(token, context) {
        const client = await this.clientForFrontendApiToken(token);
        const definitions = client.getFeatureToggleDefinitions() || [];
        const sessionId = context.sessionId || node_crypto_1.default.randomBytes(18).toString('hex');
        const resultDefinitions = definitions
            .filter((feature) => {
            const enabled = client.isEnabled(feature.name, {
                ...context,
                sessionId,
            });
            return enabled;
        })
            .map((feature) => ({
            name: feature.name,
            enabled: Boolean(feature.enabled),
            variant: client.getVariant(feature.name, {
                ...context,
                sessionId,
            }),
            impressionData: Boolean(feature.impressionData),
        }));
        return resultDefinitions;
    }
    async registerFrontendApiMetrics(token, metrics, ip) {
        FrontendApiService.assertExpectedTokenType(token);
        const environment = this.services.clientMetricsServiceV2.resolveMetricsEnvironment(token, metrics);
        await this.services.clientMetricsServiceV2.registerClientMetrics({
            ...metrics,
            environment,
        }, ip);
    }
    async clientForFrontendApiToken(token) {
        FrontendApiService.assertExpectedTokenType(token);
        let client = this.clients.get(token.secret);
        if (!client) {
            client = this.createClientForFrontendApiToken(token);
            this.clients.set(token.secret, client);
            this.config.eventBus.emit(metric_events_1.FRONTEND_API_REPOSITORY_CREATED);
        }
        return client;
    }
    async createClientForFrontendApiToken(token) {
        const repository = new frontend_api_repository_1.FrontendApiRepository(this.config, this.globalFrontendApiCache, token);
        const client = new unleash_client_1.Unleash({
            appName: 'frontend-api',
            url: 'unused',
            storageProvider: new unleash_client_1.InMemStorageProvider(),
            disableMetrics: true,
            repository,
            disableAutoStart: true,
            skipInstanceCountWarning: true,
        });
        client.on(unleash_client_1.UnleashEvents.Error, (error) => {
            this.logger.error('We found an event error', error);
        });
        await client.start();
        return client;
    }
    async deleteClientForFrontendApiToken(secret) {
        const clientPromise = this.clients.get(secret);
        if (clientPromise) {
            const client = await clientPromise;
            client.destroy();
            this.clients.delete(secret);
        }
    }
    stopAll() {
        this.clients.forEach((promise) => promise.then((c) => c.destroy()));
    }
    refreshData() {
        return this.globalFrontendApiCache.refreshData();
    }
    static assertExpectedTokenType({ type }) {
        if (!(type === api_token_1.ApiTokenType.FRONTEND || type === api_token_1.ApiTokenType.ADMIN)) {
            throw new error_1.InvalidTokenError();
        }
    }
    async setFrontendSettings(value, auditUser) {
        const error = (0, util_1.validateOrigins)(value.frontendApiOrigins);
        if (error) {
            throw new error_1.BadDataError(error);
        }
        await this.services.settingService.insert(frontend_settings_1.frontendSettingsKey, value, auditUser, false);
    }
    async setFrontendCorsSettings(value, auditUser) {
        const error = (0, util_1.validateOrigins)(value);
        if (error) {
            throw new error_1.BadDataError(error);
        }
        const settings = (await this.getFrontendSettings(false)) || {};
        await this.services.settingService.insert(frontend_settings_1.frontendSettingsKey, { ...settings, frontendApiOrigins: value }, auditUser, false);
    }
    async fetchFrontendSettings() {
        try {
            this.cachedFrontendSettings =
                await this.services.settingService.getWithDefault(frontend_settings_1.frontendSettingsKey, {
                    frontendApiOrigins: this.config.frontendApiOrigins,
                });
        }
        catch (error) {
            this.logger.debug('Unable to fetch frontend settings', error);
        }
        return this.cachedFrontendSettings;
    }
    async getFrontendSettings(useCache = true) {
        if (useCache && this.cachedFrontendSettings) {
            return this.cachedFrontendSettings;
        }
        return this.fetchFrontendSettings();
    }
}
exports.FrontendApiService = FrontendApiService;
//# sourceMappingURL=frontend-api-service.js.map