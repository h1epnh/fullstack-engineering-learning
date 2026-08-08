"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const store_1 = __importDefault(require("../../../../test/fixtures/store"));
const no_logger_1 = __importDefault(require("../../../../test/fixtures/no-logger"));
const app_1 = __importDefault(require("../../../app"));
const services_1 = require("../../../services");
const client_feature_toggle_controller_1 = __importDefault(require("../client-feature-toggle.controller"));
const test_config_1 = require("../../../../test/config/test-config");
const date_fns_1 = require("date-fns");
const client_spec_service_1 = require("../../../services/client-spec-service");
let app;
async function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = (0, store_1.default)();
    const config = (0, test_config_1.createTestConfig)({
        server: { baseUriPath: base },
    });
    const services = (0, services_1.createServices)(stores, config);
    app = await (0, app_1.default)(config, stores, services);
    return {
        base,
        clientFeatureToggleStore: stores.clientFeatureToggleStore,
        request: (0, supertest_1.default)(app),
    };
}
const callGetAll = async (controller) => {
    await controller.getAll(
    // @ts-expect-error
    { query: {}, header: () => undefined, headers: {} }, {
        json: () => { },
        setHeader: () => undefined,
    });
};
let base;
let request;
let flagResolver;
beforeEach(async () => {
    const setup = await getSetup();
    base = setup.base;
    request = setup.request;
    flagResolver = {
        isEnabled: () => {
            return false;
        },
        getVariant: () => {
            return {
                name: 'disabled',
                feature_enabled: false,
                enabled: false,
            };
        },
    };
});
test('should get empty getFeatures via client', () => {
    expect.assertions(1);
    return request
        .get(`${base}/api/client/features`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
        expect(res.body.features.length === 0).toBe(true);
    });
});
test('if caching is enabled should memoize', async () => {
    const getClientFeatures = jest.fn().mockReturnValue([]);
    const getActiveSegmentsForClient = jest.fn().mockReturnValue([]);
    const respondWithValidation = jest.fn().mockReturnValue({});
    const validPath = jest.fn().mockReturnValue(jest.fn());
    const clientSpecService = new client_spec_service_1.ClientSpecService({ getLogger: no_logger_1.default });
    const openApiService = { respondWithValidation, validPath };
    const clientFeatureToggleService = {
        getClientFeatures,
        getActiveSegmentsForClient,
    };
    const featureToggleService = { getClientFeatures };
    const configurationRevisionService = { getMaxRevisionId: () => 1 };
    const controller = new client_feature_toggle_controller_1.default({
        clientSpecService,
        // @ts-expect-error due to partial implementation
        openApiService,
        // @ts-expect-error due to partial implementation
        clientFeatureToggleService,
        // @ts-expect-error due to partial implementation
        featureToggleService,
        // @ts-expect-error due to partial implementation
        configurationRevisionService,
    }, {
        getLogger: no_logger_1.default,
        clientFeatureCaching: {
            enabled: true,
            maxAge: (0, date_fns_1.secondsToMilliseconds)(10),
        },
        flagResolver,
    });
    await callGetAll(controller);
    await callGetAll(controller);
    expect(getClientFeatures).toHaveBeenCalledTimes(1);
});
test('if caching is not enabled all calls goes to service', async () => {
    const getClientFeatures = jest.fn().mockReturnValue([]);
    const getActiveSegmentsForClient = jest.fn().mockReturnValue([]);
    const respondWithValidation = jest.fn().mockReturnValue({});
    const validPath = jest.fn().mockReturnValue(jest.fn());
    const clientSpecService = new client_spec_service_1.ClientSpecService({ getLogger: no_logger_1.default });
    const clientFeatureToggleService = {
        getClientFeatures,
        getActiveSegmentsForClient,
    };
    const featureToggleService = { getClientFeatures };
    const openApiService = { respondWithValidation, validPath };
    const configurationRevisionService = { getMaxRevisionId: () => 1 };
    const controller = new client_feature_toggle_controller_1.default({
        clientSpecService,
        // @ts-expect-error due to partial implementation
        openApiService,
        // @ts-expect-error due to partial implementation
        clientFeatureToggleService,
        // @ts-expect-error due to partial implementation
        featureToggleService,
        // @ts-expect-error due to partial implementation
        configurationRevisionService,
    }, {
        getLogger: no_logger_1.default,
        clientFeatureCaching: {
            enabled: false,
            maxAge: (0, date_fns_1.secondsToMilliseconds)(10),
        },
        flagResolver,
    });
    await callGetAll(controller);
    await callGetAll(controller);
    expect(getClientFeatures).toHaveBeenCalledTimes(2);
});
//# sourceMappingURL=client-feature-toggle.e2e.test.js.map