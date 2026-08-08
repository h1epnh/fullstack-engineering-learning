"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClientFeatureToggleDelta = void 0;
const client_feature_toggle_delta_1 = require("./client-feature-toggle-delta");
const event_store_1 = __importDefault(require("../../events/event-store"));
const configuration_revision_service_1 = __importDefault(require("../../feature-toggle/configuration-revision-service"));
const client_feature_toggle_delta_read_model_1 = __importDefault(require("./client-feature-toggle-delta-read-model"));
const segment_read_model_1 = require("../../segment/segment-read-model");
const createClientFeatureToggleDelta = (db, config) => {
    const { getLogger, eventBus, flagResolver } = config;
    const eventStore = new event_store_1.default(db, getLogger);
    const clientFeatureToggleDeltaReadModel = new client_feature_toggle_delta_read_model_1.default(db, eventBus);
    const configurationRevisionService = configuration_revision_service_1.default.getInstance({ eventStore }, config);
    const segmentReadModel = new segment_read_model_1.SegmentReadModel(db);
    const clientFeatureToggleDelta = client_feature_toggle_delta_1.ClientFeatureToggleDelta.getInstance(clientFeatureToggleDeltaReadModel, segmentReadModel, eventStore, configurationRevisionService, flagResolver, config);
    return clientFeatureToggleDelta;
};
exports.createClientFeatureToggleDelta = createClientFeatureToggleDelta;
//# sourceMappingURL=createClientFeatureToggleDelta.js.map