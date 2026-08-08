"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeFeatureLifecycleService = exports.createFeatureLifecycleService = void 0;
const fake_event_store_1 = __importDefault(require("../../../test/fixtures/fake-event-store"));
const fake_feature_lifecycle_store_1 = require("./fake-feature-lifecycle-store");
const feature_lifecycle_service_1 = require("./feature-lifecycle-service");
const fake_environment_store_1 = __importDefault(require("../project-environments/fake-environment-store"));
const event_store_1 = __importDefault(require("../../db/event-store"));
const feature_lifecycle_store_1 = require("./feature-lifecycle-store");
const environment_store_1 = __importDefault(require("../project-environments/environment-store"));
const feature_environment_store_1 = require("../../db/feature-environment-store");
const fake_feature_environment_store_1 = __importDefault(require("../../../test/fixtures/fake-feature-environment-store"));
const createEventsService_1 = require("../events/createEventsService");
const createFeatureLifecycleService = (config) => (db) => {
    const { eventBus, getLogger } = config;
    const eventStore = new event_store_1.default(db, getLogger);
    const featureLifecycleStore = new feature_lifecycle_store_1.FeatureLifecycleStore(db);
    const environmentStore = new environment_store_1.default(db, eventBus, config);
    const featureEnvironmentStore = new feature_environment_store_1.FeatureEnvironmentStore(db, eventBus, config);
    const eventService = (0, createEventsService_1.createEventsService)(db, config);
    const featureLifecycleService = new feature_lifecycle_service_1.FeatureLifecycleService({
        eventStore,
        featureLifecycleStore,
        environmentStore,
        featureEnvironmentStore,
    }, {
        eventService,
    }, config);
    return featureLifecycleService;
};
exports.createFeatureLifecycleService = createFeatureLifecycleService;
const createFakeFeatureLifecycleService = (config) => {
    const eventStore = new fake_event_store_1.default();
    const featureLifecycleStore = new fake_feature_lifecycle_store_1.FakeFeatureLifecycleStore();
    const environmentStore = new fake_environment_store_1.default();
    const featureEnvironmentStore = new fake_feature_environment_store_1.default();
    const eventService = (0, createEventsService_1.createFakeEventsService)(config);
    const featureLifecycleService = new feature_lifecycle_service_1.FeatureLifecycleService({
        eventStore,
        featureLifecycleStore,
        environmentStore,
        featureEnvironmentStore,
    }, {
        eventService,
    }, config);
    return {
        featureLifecycleService,
        featureLifecycleStore,
        eventStore,
        environmentStore,
        featureEnvironmentStore,
    };
};
exports.createFakeFeatureLifecycleService = createFakeFeatureLifecycleService;
//# sourceMappingURL=createFeatureLifecycle.js.map