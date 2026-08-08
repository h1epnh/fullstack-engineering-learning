"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeSegmentService = exports.createSegmentService = void 0;
const services_1 = require("../../services");
const feature_toggle_strategies_store_1 = __importDefault(require("../feature-toggle/feature-toggle-strategies-store"));
const segment_store_1 = __importDefault(require("./segment-store"));
const fake_segment_store_1 = __importDefault(require("../../../test/fixtures/fake-segment-store"));
const fake_feature_strategies_store_1 = __importDefault(require("../feature-toggle/fakes/fake-feature-strategies-store"));
const createChangeRequestAccessReadModel_1 = require("../change-request-access-service/createChangeRequestAccessReadModel");
const createChangeRequestSegmentUsageReadModel_1 = require("../change-request-segment-usage-service/createChangeRequestSegmentUsageReadModel");
const createPrivateProjectChecker_1 = require("../private-project/createPrivateProjectChecker");
const createEventsService_1 = require("../events/createEventsService");
const createSegmentService = (db, config) => {
    const { eventBus, getLogger, flagResolver } = config;
    const segmentStore = new segment_store_1.default(db, eventBus, getLogger, flagResolver);
    const featureStrategiesStore = new feature_toggle_strategies_store_1.default(db, eventBus, getLogger, flagResolver);
    const changeRequestAccessReadModel = (0, createChangeRequestAccessReadModel_1.createChangeRequestAccessReadModel)(db, config);
    const changeRequestSegmentUsageReadModel = (0, createChangeRequestSegmentUsageReadModel_1.createChangeRequestSegmentUsageReadModel)(db);
    const privateProjectChecker = (0, createPrivateProjectChecker_1.createPrivateProjectChecker)(db, config);
    const eventService = (0, createEventsService_1.createEventsService)(db, config);
    return new services_1.SegmentService({ segmentStore, featureStrategiesStore }, changeRequestAccessReadModel, changeRequestSegmentUsageReadModel, config, eventService, privateProjectChecker);
};
exports.createSegmentService = createSegmentService;
const createFakeSegmentService = (config) => {
    const segmentStore = new fake_segment_store_1.default();
    const featureStrategiesStore = new fake_feature_strategies_store_1.default();
    const changeRequestAccessReadModel = (0, createChangeRequestAccessReadModel_1.createFakeChangeRequestAccessService)();
    const changeRequestSegmentUsageReadModel = (0, createChangeRequestSegmentUsageReadModel_1.createFakeChangeRequestSegmentUsageReadModel)();
    const privateProjectChecker = (0, createPrivateProjectChecker_1.createFakePrivateProjectChecker)();
    const eventService = (0, createEventsService_1.createFakeEventsService)(config);
    return new services_1.SegmentService({ segmentStore, featureStrategiesStore }, changeRequestAccessReadModel, changeRequestSegmentUsageReadModel, config, eventService, privateProjectChecker);
};
exports.createFakeSegmentService = createFakeSegmentService;
//# sourceMappingURL=createSegmentService.js.map