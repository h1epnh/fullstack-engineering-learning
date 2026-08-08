"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../types");
const createFeatureLifecycle_1 = require("./createFeatureLifecycle");
const events_1 = __importDefault(require("events"));
const no_logger_1 = __importDefault(require("../../../test/fixtures/no-logger"));
const metric_events_1 = require("../../metric-events");
test('can insert and read lifecycle stages', async () => {
    const eventBus = new events_1.default();
    const { featureLifecycleService, eventStore, environmentStore, featureEnvironmentStore, } = (0, createFeatureLifecycle_1.createFakeFeatureLifecycleService)({
        flagResolver: { isEnabled: () => true },
        eventBus,
        getLogger: no_logger_1.default,
    });
    const featureName = 'testFeature';
    await featureEnvironmentStore.addEnvironmentToFeature(featureName, 'my-prod-environment', true);
    function emitMetricsEvent(environment) {
        eventBus.emit(types_1.CLIENT_METRICS_ADDED, [
            {
                featureName,
                environment,
            },
        ]);
    }
    function reachedStage(feature, name) {
        return new Promise((resolve) => eventBus.on(metric_events_1.STAGE_ENTERED, (event) => {
            if (event.stage === name && event.feature === feature)
                resolve(name);
        }));
    }
    await environmentStore.create({
        name: 'my-dev-environment',
        type: 'test',
    });
    await environmentStore.create({
        name: 'my-prod-environment',
        type: 'production',
    });
    await environmentStore.create({
        name: 'my-another-dev-environment',
        type: 'development',
    });
    await environmentStore.create({
        name: 'my-another-prod-environment',
        type: 'production',
    });
    featureLifecycleService.listen();
    eventStore.emit(types_1.FEATURE_CREATED, { featureName });
    await reachedStage(featureName, 'initial');
    emitMetricsEvent('unknown-environment');
    emitMetricsEvent('my-dev-environment');
    await reachedStage(featureName, 'pre-live');
    emitMetricsEvent('my-dev-environment');
    emitMetricsEvent('my-another-dev-environment');
    emitMetricsEvent('my-prod-environment');
    await reachedStage(featureName, 'live');
    emitMetricsEvent('my-prod-environment');
    emitMetricsEvent('my-another-prod-environment');
    eventStore.emit(types_1.FEATURE_ARCHIVED, { featureName });
    await reachedStage(featureName, 'archived');
    const lifecycle = await featureLifecycleService.getFeatureLifecycle(featureName);
    expect(lifecycle).toEqual([
        { stage: 'initial', enteredStageAt: expect.any(Date) },
        { stage: 'pre-live', enteredStageAt: expect.any(Date) },
        { stage: 'live', enteredStageAt: expect.any(Date) },
        { stage: 'archived', enteredStageAt: expect.any(Date) },
    ]);
    eventStore.emit(types_1.FEATURE_REVIVED, { featureName });
    await reachedStage(featureName, 'initial');
    const initialLifecycle = await featureLifecycleService.getFeatureLifecycle(featureName);
    expect(initialLifecycle).toEqual([
        { stage: 'initial', enteredStageAt: expect.any(Date) },
    ]);
});
//# sourceMappingURL=feature-lifecycle-service.test.js.map