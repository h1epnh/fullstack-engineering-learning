"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeProjectInsightsService = exports.createProjectInsightsService = void 0;
const feature_toggle_store_1 = __importDefault(require("../feature-toggle/feature-toggle-store"));
const project_stats_store_1 = __importDefault(require("../../db/project-stats-store"));
const fake_project_store_1 = __importDefault(require("../../../test/fixtures/fake-project-store"));
const fake_feature_toggle_store_1 = __importDefault(require("../feature-toggle/fakes/fake-feature-toggle-store"));
const fake_project_stats_store_1 = __importDefault(require("../../../test/fixtures/fake-project-stats-store"));
const feature_type_store_1 = __importDefault(require("../../db/feature-type-store"));
const fake_feature_type_store_1 = __importDefault(require("../../../test/fixtures/fake-feature-type-store"));
const project_insights_service_1 = require("./project-insights-service");
const project_store_1 = __importDefault(require("../project/project-store"));
const feature_toggle_strategies_store_1 = __importDefault(require("../feature-toggle/feature-toggle-strategies-store"));
const fake_feature_strategies_store_1 = __importDefault(require("../feature-toggle/fakes/fake-feature-strategies-store"));
const createProjectInsightsService = (db, config) => {
    const { eventBus, getLogger, flagResolver } = config;
    const projectStore = new project_store_1.default(db, eventBus, config);
    const featureToggleStore = new feature_toggle_store_1.default(db, eventBus, getLogger, flagResolver);
    const featureTypeStore = new feature_type_store_1.default(db, getLogger);
    const projectStatsStore = new project_stats_store_1.default(db, eventBus, getLogger);
    const featureStrategiesStore = new feature_toggle_strategies_store_1.default(db, eventBus, getLogger, flagResolver);
    return new project_insights_service_1.ProjectInsightsService({
        projectStore,
        featureToggleStore,
        featureTypeStore,
        projectStatsStore,
        featureStrategiesStore,
    });
};
exports.createProjectInsightsService = createProjectInsightsService;
const createFakeProjectInsightsService = () => {
    const projectStore = new fake_project_store_1.default();
    const featureToggleStore = new fake_feature_toggle_store_1.default();
    const featureTypeStore = new fake_feature_type_store_1.default();
    const projectStatsStore = new fake_project_stats_store_1.default();
    const featureStrategiesStore = new fake_feature_strategies_store_1.default();
    const projectInsightsService = new project_insights_service_1.ProjectInsightsService({
        projectStore,
        featureToggleStore,
        featureTypeStore,
        projectStatsStore,
        featureStrategiesStore,
    });
    return {
        projectInsightsService,
        projectStatsStore,
        featureToggleStore,
        projectStore,
    };
};
exports.createFakeProjectInsightsService = createFakeProjectInsightsService;
//# sourceMappingURL=createProjectInsightsService.js.map