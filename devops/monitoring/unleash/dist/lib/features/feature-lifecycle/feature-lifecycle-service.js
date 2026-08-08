"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureLifecycleService = void 0;
const types_1 = require("../../types");
const lodash_groupby_1 = __importDefault(require("lodash.groupby"));
const metric_events_1 = require("../../metric-events");
class FeatureLifecycleService {
    constructor({ eventStore, featureLifecycleStore, environmentStore, featureEnvironmentStore, }, { eventService, }, { flagResolver, eventBus, getLogger, }) {
        this.eventStore = eventStore;
        this.featureLifecycleStore = featureLifecycleStore;
        this.environmentStore = environmentStore;
        this.featureEnvironmentStore = featureEnvironmentStore;
        this.flagResolver = flagResolver;
        this.eventBus = eventBus;
        this.eventService = eventService;
        this.logger = getLogger('feature-lifecycle/feature-lifecycle-service.ts');
    }
    listen() {
        this.featureLifecycleStore.backfill();
        this.eventStore.on(types_1.FEATURE_CREATED, async (event) => {
            await this.featureInitialized(event.featureName);
        });
        this.eventBus.on(types_1.CLIENT_METRICS_ADDED, async (events) => {
            if (events.length > 0) {
                const groupedByEnvironment = (0, lodash_groupby_1.default)(events, 'environment');
                for (const [environment, metrics] of Object.entries(groupedByEnvironment)) {
                    const features = metrics.map((metric) => metric.featureName);
                    await this.featuresReceivedMetrics(features, environment);
                }
            }
        });
        this.eventStore.on(types_1.FEATURE_ARCHIVED, async (event) => {
            await this.featureArchived(event.featureName);
        });
        this.eventStore.on(types_1.FEATURE_REVIVED, async (event) => {
            await this.featureRevived(event.featureName);
        });
    }
    async getFeatureLifecycle(feature) {
        return this.featureLifecycleStore.get(feature);
    }
    async featureInitialized(feature) {
        const result = await this.featureLifecycleStore.insert([
            { feature, stage: 'initial' },
        ]);
        this.recordStagesEntered(result);
    }
    async stageReceivedMetrics(features, stage) {
        const newlyEnteredStages = await this.featureLifecycleStore.insert(features.map((feature) => ({ feature, stage })));
        this.recordStagesEntered(newlyEnteredStages);
    }
    recordStagesEntered(newlyEnteredStages) {
        newlyEnteredStages.forEach(({ stage, feature }) => {
            this.eventBus.emit(metric_events_1.STAGE_ENTERED, { stage, feature });
        });
    }
    async featuresReceivedMetrics(features, environment) {
        try {
            const env = await this.environmentStore.get(environment);
            if (!env) {
                return;
            }
            await this.stageReceivedMetrics(features, 'pre-live');
            if (env.type === 'production') {
                const featureEnv = await this.featureEnvironmentStore.getAllByFeatures(features, env.name);
                const enabledFeatures = featureEnv
                    .filter((feature) => feature.enabled)
                    .map((feature) => feature.featureName);
                await this.stageReceivedMetrics(enabledFeatures, 'live');
            }
        }
        catch (e) {
            this.logger.warn(`Error handling ${features.length} metrics in ${environment}`, e);
        }
    }
    async featureCompleted(feature, projectId, status, auditUser) {
        const result = await this.featureLifecycleStore.insert([
            {
                feature,
                stage: 'completed',
                status: status.status,
                statusValue: status.statusValue,
            },
        ]);
        this.recordStagesEntered(result);
        await this.eventService.storeEvent(new types_1.FeatureCompletedEvent({
            project: projectId,
            featureName: feature,
            data: { ...status, kept: status.status === 'kept' },
            auditUser,
        }));
    }
    async featureUncompleted(feature, projectId, auditUser) {
        await this.featureLifecycleStore.deleteStage({
            feature,
            stage: 'completed',
        });
        await this.eventService.storeEvent(new types_1.FeatureUncompletedEvent({
            project: projectId,
            featureName: feature,
            auditUser,
        }));
    }
    async featureArchived(feature) {
        const result = await this.featureLifecycleStore.insert([
            { feature, stage: 'archived' },
        ]);
        this.recordStagesEntered(result);
    }
    async featureRevived(feature) {
        await this.featureLifecycleStore.delete(feature);
        await this.featureInitialized(feature);
    }
}
exports.FeatureLifecycleService = FeatureLifecycleService;
//# sourceMappingURL=feature-lifecycle-service.js.map