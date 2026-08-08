"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const global_frontend_api_cache_1 = require("./global-frontend-api-cache");
const no_logger_1 = __importDefault(require("../../../test/fixtures/no-logger"));
const fake_segment_read_model_1 = require("../segment/fake-segment-read-model");
const fake_client_feature_toggle_read_model_1 = __importDefault(require("./fake-client-feature-toggle-read-model"));
const events_1 = __importDefault(require("events"));
const configuration_revision_service_1 = require("../feature-toggle/configuration-revision-service");
const state = async (cache, state) => {
    await new Promise((resolve) => {
        cache.on(state, () => {
            resolve('done');
        });
    });
};
const defaultFeature = {
    name: 'featureA',
    enabled: true,
    strategies: [],
    variants: [],
    project: 'projectA',
    dependencies: [],
    type: 'release',
    stale: false,
    description: '',
};
const defaultSegment = { name: 'segment', id: 1 };
const alwaysOnFlagResolver = {
    isEnabled() {
        return true;
    },
};
const createCache = (segment = defaultSegment, features = {}) => {
    const config = {
        getLogger: no_logger_1.default,
        flagResolver: alwaysOnFlagResolver,
        eventBus: { emit: jest.fn() },
    };
    const segmentReadModel = new fake_segment_read_model_1.FakeSegmentReadModel([segment]);
    const clientFeatureToggleReadModel = new fake_client_feature_toggle_read_model_1.default(features);
    const configurationRevisionService = new events_1.default();
    const cache = new global_frontend_api_cache_1.GlobalFrontendApiCache(config, segmentReadModel, clientFeatureToggleReadModel, configurationRevisionService);
    return {
        cache,
        configurationRevisionService,
        clientFeatureToggleReadModel,
    };
};
test('Can read initial segment', async () => {
    const { cache } = createCache({ name: 'segment', id: 1 });
    const segmentBeforeRead = cache.getSegment(1);
    expect(segmentBeforeRead).toEqual(undefined);
    await state(cache, 'ready');
    const segment = cache.getSegment(1);
    expect(segment).toEqual({ name: 'segment', id: 1 });
});
test('Can read initial features', async () => {
    const { cache } = createCache(defaultSegment, {
        development: {
            featureA: {
                ...defaultFeature,
                name: 'featureA',
                enabled: true,
                project: 'projectA',
            },
            featureB: {
                ...defaultFeature,
                name: 'featureB',
                enabled: true,
                project: 'projectB',
            },
        },
        production: {
            featureA: {
                ...defaultFeature,
                name: 'featureA',
                enabled: false,
                project: 'projectA',
            },
        },
    });
    const featuresBeforeRead = cache.getToggles({
        environment: 'development',
        projects: ['projectA'],
    });
    expect(featuresBeforeRead).toEqual([]);
    await state(cache, 'ready');
    const features = cache.getToggles({
        environment: 'development',
        projects: ['projectA'],
    });
    expect(features).toEqual([
        {
            ...defaultFeature,
            name: 'featureA',
            enabled: true,
            impressionData: false,
        },
    ]);
    const allProjectFeatures = cache.getToggles({
        environment: 'development',
        projects: ['*'],
    });
    expect(allProjectFeatures.length).toBe(2);
    const defaultProjectFeatures = cache.getToggles({
        environment: '*',
        projects: ['*'],
    });
    expect(defaultProjectFeatures.length).toBe(0);
    const singleToggle = cache.getToggle('featureA', {
        environment: 'development',
        projects: ['*'],
    });
    expect(singleToggle).toMatchObject({
        ...defaultFeature,
        name: 'featureA',
        enabled: true,
        impressionData: false,
    });
});
test('Can refresh data on revision update', async () => {
    const { cache, configurationRevisionService, clientFeatureToggleReadModel, } = createCache();
    await state(cache, 'ready');
    clientFeatureToggleReadModel.setValue({
        development: {
            featureA: {
                ...defaultFeature,
                name: 'featureA',
                enabled: false,
                strategies: [{ name: 'default' }],
                project: 'projectA',
            },
        },
    });
    configurationRevisionService.emit(configuration_revision_service_1.UPDATE_REVISION);
    await state(cache, 'updated');
    const features = cache.getToggles({
        environment: 'development',
        projects: ['projectA'],
    });
    expect(features).toMatchObject([
        {
            ...defaultFeature,
            name: 'featureA',
            enabled: false,
            strategies: [{ name: 'default' }],
            impressionData: false,
        },
    ]);
});
//# sourceMappingURL=global-frontend-api-cache.test.js.map