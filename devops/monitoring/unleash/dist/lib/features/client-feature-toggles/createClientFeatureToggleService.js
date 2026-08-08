"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeClientFeatureToggleService = exports.createClientFeatureToggleService = void 0;
const client_feature_toggle_store_1 = __importDefault(require("../client-feature-toggles/client-feature-toggle-store"));
const fake_client_feature_toggle_store_1 = __importDefault(require("./fakes/fake-client-feature-toggle-store"));
const client_feature_toggle_service_1 = require("./client-feature-toggle-service");
const segment_read_model_1 = require("../segment/segment-read-model");
const fake_segment_read_model_1 = require("../segment/fake-segment-read-model");
const createClientFeatureToggleDelta_1 = require("./delta/createClientFeatureToggleDelta");
const createClientFeatureToggleService = (db, config) => {
    const featureToggleClientStore = new client_feature_toggle_store_1.default(db, config.eventBus, config);
    const segmentReadModel = new segment_read_model_1.SegmentReadModel(db);
    const clientFeatureToggleCache = (0, createClientFeatureToggleDelta_1.createClientFeatureToggleDelta)(db, config);
    const clientFeatureToggleService = new client_feature_toggle_service_1.ClientFeatureToggleService({
        clientFeatureToggleStore: featureToggleClientStore,
    }, segmentReadModel, clientFeatureToggleCache, config);
    return clientFeatureToggleService;
};
exports.createClientFeatureToggleService = createClientFeatureToggleService;
const createFakeClientFeatureToggleService = (config) => {
    const fakeClientFeatureToggleStore = new fake_client_feature_toggle_store_1.default();
    const fakeSegmentReadModel = new fake_segment_read_model_1.FakeSegmentReadModel();
    const clientFeatureToggleService = new client_feature_toggle_service_1.ClientFeatureToggleService({
        clientFeatureToggleStore: fakeClientFeatureToggleStore,
    }, fakeSegmentReadModel, null, config);
    return clientFeatureToggleService;
};
exports.createFakeClientFeatureToggleService = createFakeClientFeatureToggleService;
//# sourceMappingURL=createClientFeatureToggleService.js.map