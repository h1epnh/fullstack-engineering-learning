"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeFrontendApiService = exports.createFrontendApiService = void 0;
const frontend_api_service_1 = require("./frontend-api-service");
const segment_read_model_1 = require("../segment/segment-read-model");
const setting_service_1 = __importDefault(require("../../services/setting-service"));
const setting_store_1 = __importDefault(require("../../db/setting-store"));
const index_1 = require("../index");
const global_frontend_api_cache_1 = require("./global-frontend-api-cache");
const client_feature_toggle_read_model_1 = __importDefault(require("./client-feature-toggle-read-model"));
const fake_segment_read_model_1 = require("../segment/fake-segment-read-model");
const fake_setting_store_1 = __importDefault(require("../../../test/fixtures/fake-setting-store"));
const fake_client_feature_toggle_read_model_1 = __importDefault(require("./fake-client-feature-toggle-read-model"));
const createFrontendApiService = (db, config, 
// client metrics service needs to be shared because it uses in-memory cache
clientMetricsServiceV2, configurationRevisionService) => {
    const segmentReadModel = new segment_read_model_1.SegmentReadModel(db);
    const settingStore = new setting_store_1.default(db, config.getLogger);
    const eventService = (0, index_1.createEventsService)(db, config);
    const settingService = new setting_service_1.default({ settingStore }, config, eventService);
    // TODO: remove this dependency after we migrate frontend API
    const featureToggleService = (0, index_1.createFeatureToggleService)(db, config);
    const clientFeatureToggleReadModel = new client_feature_toggle_read_model_1.default(db, config.eventBus);
    const globalFrontendApiCache = new global_frontend_api_cache_1.GlobalFrontendApiCache(config, segmentReadModel, clientFeatureToggleReadModel, configurationRevisionService);
    return new frontend_api_service_1.FrontendApiService(config, { segmentReadModel }, {
        featureToggleService,
        clientMetricsServiceV2,
        settingService,
        configurationRevisionService,
    }, globalFrontendApiCache);
};
exports.createFrontendApiService = createFrontendApiService;
const createFakeFrontendApiService = (config, clientMetricsServiceV2, configurationRevisionService) => {
    const segmentReadModel = new fake_segment_read_model_1.FakeSegmentReadModel();
    const settingStore = new fake_setting_store_1.default();
    const eventService = (0, index_1.createFakeEventsService)(config);
    const settingService = new setting_service_1.default({ settingStore }, config, eventService);
    // TODO: remove this dependency after we migrate frontend API
    const featureToggleService = (0, index_1.createFakeFeatureToggleService)(config).featureToggleService;
    const clientFeatureToggleReadModel = new fake_client_feature_toggle_read_model_1.default();
    const globalFrontendApiCache = new global_frontend_api_cache_1.GlobalFrontendApiCache(config, segmentReadModel, clientFeatureToggleReadModel, configurationRevisionService);
    return new frontend_api_service_1.FrontendApiService(config, { segmentReadModel }, {
        featureToggleService,
        clientMetricsServiceV2,
        settingService,
        configurationRevisionService,
    }, globalFrontendApiCache);
};
exports.createFakeFrontendApiService = createFakeFrontendApiService;
//# sourceMappingURL=createFrontendApiService.js.map