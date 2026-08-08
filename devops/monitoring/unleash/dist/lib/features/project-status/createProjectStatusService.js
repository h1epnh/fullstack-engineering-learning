"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeProjectStatusService = exports.createProjectStatusService = void 0;
const project_status_service_1 = require("./project-status-service");
const event_store_1 = __importDefault(require("../events/event-store"));
const fake_event_store_1 = __importDefault(require("../../../test/fixtures/fake-event-store"));
const project_store_1 = __importDefault(require("../project/project-store"));
const fake_project_store_1 = __importDefault(require("../../../test/fixtures/fake-project-store"));
const fake_api_token_store_1 = __importDefault(require("../../../test/fixtures/fake-api-token-store"));
const api_token_store_1 = require("../../db/api-token-store");
const segment_store_1 = __importDefault(require("../segment/segment-store"));
const fake_segment_store_1 = __importDefault(require("../../../test/fixtures/fake-segment-store"));
const createProjectLifecycleSummaryReadModel_1 = require("./project-lifecycle-read-model/createProjectLifecycleSummaryReadModel");
const project_stale_flags_read_model_1 = require("./project-stale-flags-read-model/project-stale-flags-read-model");
const fake_project_stale_flags_read_model_1 = require("./project-stale-flags-read-model/fake-project-stale-flags-read-model");
const feature_type_store_1 = __importDefault(require("../../db/feature-type-store"));
const feature_toggle_store_1 = __importDefault(require("../feature-toggle/feature-toggle-store"));
const fake_feature_toggle_store_1 = __importDefault(require("../feature-toggle/fakes/fake-feature-toggle-store"));
const fake_feature_type_store_1 = __importDefault(require("../../../test/fixtures/fake-feature-type-store"));
const createProjectStatusService = (db, config) => {
    const eventStore = new event_store_1.default(db, config.getLogger);
    const projectStore = new project_store_1.default(db, config.eventBus, config);
    const apiTokenStore = new api_token_store_1.ApiTokenStore(db, config.eventBus, config.getLogger, config.flagResolver);
    const segmentStore = new segment_store_1.default(db, config.eventBus, config.getLogger, config.flagResolver);
    const projectLifecycleSummaryReadModel = (0, createProjectLifecycleSummaryReadModel_1.createProjectLifecycleSummaryReadModel)(db, config);
    const projectStaleFlagsReadModel = new project_stale_flags_read_model_1.ProjectStaleFlagsReadModel(db);
    const featureTypeStore = new feature_type_store_1.default(db, config.getLogger);
    const featureToggleStore = new feature_toggle_store_1.default(db, config.eventBus, config.getLogger, config.flagResolver);
    return new project_status_service_1.ProjectStatusService({
        eventStore,
        projectStore,
        apiTokenStore,
        segmentStore,
        featureTypeStore,
        featureToggleStore,
    }, projectLifecycleSummaryReadModel, projectStaleFlagsReadModel);
};
exports.createProjectStatusService = createProjectStatusService;
const createFakeProjectStatusService = () => {
    const eventStore = new fake_event_store_1.default();
    const projectStore = new fake_project_store_1.default();
    const apiTokenStore = new fake_api_token_store_1.default();
    const segmentStore = new fake_segment_store_1.default();
    const featureTypeStore = new fake_feature_type_store_1.default();
    const featureToggleStore = new fake_feature_toggle_store_1.default();
    const projectStatusService = new project_status_service_1.ProjectStatusService({
        eventStore,
        projectStore,
        apiTokenStore,
        segmentStore,
        featureTypeStore,
        featureToggleStore,
    }, (0, createProjectLifecycleSummaryReadModel_1.createFakeProjectLifecycleSummaryReadModel)(), new fake_project_stale_flags_read_model_1.FakeProjectStaleFlagsReadModel());
    return {
        projectStatusService,
    };
};
exports.createFakeProjectStatusService = createFakeProjectStatusService;
//# sourceMappingURL=createProjectStatusService.js.map