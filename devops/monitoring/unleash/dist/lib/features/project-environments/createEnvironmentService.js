"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeEnvironmentService = exports.createEnvironmentService = void 0;
const environment_service_1 = __importDefault(require("./environment-service"));
const environment_store_1 = __importDefault(require("./environment-store"));
const feature_toggle_strategies_store_1 = __importDefault(require("../feature-toggle/feature-toggle-strategies-store"));
const feature_environment_store_1 = require("../../db/feature-environment-store");
const project_store_1 = __importDefault(require("../project/project-store"));
const fake_feature_environment_store_1 = __importDefault(require("../../../test/fixtures/fake-feature-environment-store"));
const fake_project_store_1 = __importDefault(require("../../../test/fixtures/fake-project-store"));
const fake_feature_strategies_store_1 = __importDefault(require("../feature-toggle/fakes/fake-feature-strategies-store"));
const fake_environment_store_1 = __importDefault(require("./fake-environment-store"));
const createEventsService_1 = require("../events/createEventsService");
const createEnvironmentService = (config) => (db) => {
    const { getLogger, eventBus, flagResolver } = config;
    const featureEnvironmentStore = new feature_environment_store_1.FeatureEnvironmentStore(db, eventBus, config);
    const projectStore = new project_store_1.default(db, eventBus, config);
    const featureStrategiesStore = new feature_toggle_strategies_store_1.default(db, eventBus, getLogger, flagResolver);
    const environmentStore = new environment_store_1.default(db, eventBus, config);
    const eventService = (0, createEventsService_1.createEventsService)(db, config);
    return new environment_service_1.default({
        environmentStore,
        featureStrategiesStore,
        featureEnvironmentStore,
        projectStore,
    }, config, eventService);
};
exports.createEnvironmentService = createEnvironmentService;
const createFakeEnvironmentService = (config) => {
    const featureEnvironmentStore = new fake_feature_environment_store_1.default();
    const projectStore = new fake_project_store_1.default();
    const featureStrategiesStore = new fake_feature_strategies_store_1.default();
    const environmentStore = new fake_environment_store_1.default();
    const eventService = (0, createEventsService_1.createFakeEventsService)(config);
    return new environment_service_1.default({
        environmentStore,
        featureStrategiesStore,
        featureEnvironmentStore,
        projectStore,
    }, config, eventService);
};
exports.createFakeEnvironmentService = createFakeEnvironmentService;
//# sourceMappingURL=createEnvironmentService.js.map