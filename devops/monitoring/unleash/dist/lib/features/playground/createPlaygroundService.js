"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakePlaygroundService = exports.createPlaygroundService = void 0;
const playground_service_1 = require("./playground-service");
const createFeatureToggleService_1 = require("../feature-toggle/createFeatureToggleService");
const createPrivateProjectChecker_1 = require("../private-project/createPrivateProjectChecker");
const segment_read_model_1 = require("../segment/segment-read-model");
const fake_segment_read_model_1 = require("../segment/fake-segment-read-model");
const createPlaygroundService = (db, config) => {
    const segmentReadModel = new segment_read_model_1.SegmentReadModel(db);
    const privateProjectChecker = (0, createPrivateProjectChecker_1.createPrivateProjectChecker)(db, config);
    const featureToggleService = (0, createFeatureToggleService_1.createFeatureToggleService)(db, config);
    const playgroundService = new playground_service_1.PlaygroundService(config, {
        featureToggleService,
        privateProjectChecker,
    }, segmentReadModel);
    return playgroundService;
};
exports.createPlaygroundService = createPlaygroundService;
const createFakePlaygroundService = (config) => {
    const segmentReadModel = new fake_segment_read_model_1.FakeSegmentReadModel();
    const privateProjectChecker = (0, createPrivateProjectChecker_1.createFakePrivateProjectChecker)();
    const featureToggleService = (0, createFeatureToggleService_1.createFakeFeatureToggleService)(config).featureToggleService;
    const playgroundService = new playground_service_1.PlaygroundService(config, {
        featureToggleService,
        privateProjectChecker,
    }, segmentReadModel);
    return playgroundService;
};
exports.createFakePlaygroundService = createFakePlaygroundService;
//# sourceMappingURL=createPlaygroundService.js.map