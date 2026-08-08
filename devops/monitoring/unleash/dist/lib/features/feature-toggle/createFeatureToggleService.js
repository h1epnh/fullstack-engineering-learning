"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeFeatureToggleService = exports.createFeatureToggleService = void 0;
const services_1 = require("../../services");
const feature_toggle_strategies_store_1 = __importDefault(require("./feature-toggle-strategies-store"));
const feature_toggle_store_1 = __importDefault(require("./feature-toggle-store"));
const client_feature_toggle_store_1 = __importDefault(require("../client-feature-toggles/client-feature-toggle-store"));
const project_store_1 = __importDefault(require("../project/project-store"));
const feature_environment_store_1 = require("../../db/feature-environment-store");
const context_field_store_1 = __importDefault(require("../context/context-field-store"));
const group_store_1 = __importDefault(require("../../db/group-store"));
const account_store_1 = require("../../db/account-store");
const access_store_1 = require("../../db/access-store");
const role_store_1 = __importDefault(require("../../db/role-store"));
const environment_store_1 = __importDefault(require("../project-environments/environment-store"));
const fake_event_store_1 = __importDefault(require("../../../test/fixtures/fake-event-store"));
const fake_feature_strategies_store_1 = __importDefault(require("./fakes/fake-feature-strategies-store"));
const fake_feature_toggle_store_1 = __importDefault(require("./fakes/fake-feature-toggle-store"));
const fake_client_feature_toggle_store_1 = __importDefault(require("../client-feature-toggles/fakes/fake-client-feature-toggle-store"));
const fake_project_store_1 = __importDefault(require("../../../test/fixtures/fake-project-store"));
const fake_feature_environment_store_1 = __importDefault(require("../../../test/fixtures/fake-feature-environment-store"));
const fake_context_field_store_1 = __importDefault(require("../context/fake-context-field-store"));
const fake_group_store_1 = __importDefault(require("../../../test/fixtures/fake-group-store"));
const fake_account_store_1 = require("../../../test/fixtures/fake-account-store");
const fake_access_store_1 = __importDefault(require("../../../test/fixtures/fake-access-store"));
const fake_role_store_1 = __importDefault(require("../../../test/fixtures/fake-role-store"));
const fake_environment_store_1 = __importDefault(require("../project-environments/fake-environment-store"));
const createChangeRequestAccessReadModel_1 = require("../change-request-access-service/createChangeRequestAccessReadModel");
const createSegmentService_1 = require("../segment/createSegmentService");
const strategy_store_1 = __importDefault(require("../../db/strategy-store"));
const fake_strategies_store_1 = __importDefault(require("../../../test/fixtures/fake-strategies-store"));
const createPrivateProjectChecker_1 = require("../private-project/createPrivateProjectChecker");
const dependent_features_read_model_1 = require("../dependent-features/dependent-features-read-model");
const fake_dependent_features_read_model_1 = require("../dependent-features/fake-dependent-features-read-model");
const feature_tag_store_1 = __importDefault(require("../../db/feature-tag-store"));
const fake_feature_tag_store_1 = __importDefault(require("../../../test/fixtures/fake-feature-tag-store"));
const createDependentFeaturesService_1 = require("../dependent-features/createDependentFeaturesService");
const createEventsService_1 = require("../events/createEventsService");
const stream_1 = require("stream");
const feature_lifecycle_read_model_1 = require("../feature-lifecycle/feature-lifecycle-read-model");
const fake_feature_lifecycle_read_model_1 = require("../feature-lifecycle/fake-feature-lifecycle-read-model");
const fake_feature_collaborators_read_model_1 = require("./fake-feature-collaborators-read-model");
const feature_collaborators_read_model_1 = require("./feature-collaborators-read-model");
const createFeatureToggleService = (db, config) => {
    const { getLogger, eventBus, flagResolver, resourceLimits } = config;
    const featureStrategiesStore = new feature_toggle_strategies_store_1.default(db, eventBus, getLogger, flagResolver);
    const featureToggleStore = new feature_toggle_store_1.default(db, eventBus, getLogger, flagResolver);
    const featureToggleClientStore = new client_feature_toggle_store_1.default(db, eventBus, config);
    const projectStore = new project_store_1.default(db, eventBus, config);
    const featureEnvironmentStore = new feature_environment_store_1.FeatureEnvironmentStore(db, eventBus, config);
    const contextFieldStore = new context_field_store_1.default(db, getLogger, flagResolver);
    const groupStore = new group_store_1.default(db);
    const strategyStore = new strategy_store_1.default(db, getLogger);
    const accountStore = new account_store_1.AccountStore(db, getLogger);
    const accessStore = new access_store_1.AccessStore(db, eventBus, getLogger);
    const featureTagStore = new feature_tag_store_1.default(db, eventBus, getLogger);
    const roleStore = new role_store_1.default(db, eventBus, getLogger);
    const environmentStore = new environment_store_1.default(db, eventBus, config);
    const eventService = (0, createEventsService_1.createEventsService)(db, config);
    const groupService = new services_1.GroupService({ groupStore, accountStore }, { getLogger }, eventService);
    const accessService = new services_1.AccessService({ accessStore, accountStore, roleStore, environmentStore }, { getLogger }, groupService, eventService);
    const segmentService = (0, createSegmentService_1.createSegmentService)(db, config);
    const changeRequestAccessReadModel = (0, createChangeRequestAccessReadModel_1.createChangeRequestAccessReadModel)(db, config);
    const privateProjectChecker = (0, createPrivateProjectChecker_1.createPrivateProjectChecker)(db, config);
    const dependentFeaturesReadModel = new dependent_features_read_model_1.DependentFeaturesReadModel(db);
    const featureLifecycleReadModel = new feature_lifecycle_read_model_1.FeatureLifecycleReadModel(db, config.flagResolver);
    const dependentFeaturesService = (0, createDependentFeaturesService_1.createDependentFeaturesService)(config)(db);
    const featureCollaboratorsReadModel = new feature_collaborators_read_model_1.FeatureCollaboratorsReadModel(db);
    const featureToggleService = new services_1.FeatureToggleService({
        featureStrategiesStore,
        featureToggleStore,
        clientFeatureToggleStore: featureToggleClientStore,
        projectStore,
        featureTagStore,
        featureEnvironmentStore,
        contextFieldStore,
        strategyStore,
    }, { getLogger, flagResolver, eventBus, resourceLimits }, segmentService, accessService, eventService, changeRequestAccessReadModel, privateProjectChecker, dependentFeaturesReadModel, dependentFeaturesService, featureLifecycleReadModel, featureCollaboratorsReadModel);
    return featureToggleService;
};
exports.createFeatureToggleService = createFeatureToggleService;
const createFakeFeatureToggleService = (config) => {
    const { getLogger, flagResolver, resourceLimits } = config;
    const eventStore = new fake_event_store_1.default();
    const strategyStore = new fake_strategies_store_1.default();
    const featureStrategiesStore = new fake_feature_strategies_store_1.default();
    const featureToggleStore = new fake_feature_toggle_store_1.default();
    const featureToggleClientStore = new fake_client_feature_toggle_store_1.default();
    const projectStore = new fake_project_store_1.default();
    const featureEnvironmentStore = new fake_feature_environment_store_1.default();
    const contextFieldStore = new fake_context_field_store_1.default();
    const groupStore = new fake_group_store_1.default();
    const accountStore = new fake_account_store_1.FakeAccountStore();
    const accessStore = new fake_access_store_1.default();
    const featureTagStore = new fake_feature_tag_store_1.default();
    const roleStore = new fake_role_store_1.default();
    const environmentStore = new fake_environment_store_1.default();
    const eventService = (0, createEventsService_1.createFakeEventsService)(config);
    const groupService = new services_1.GroupService({ groupStore, accountStore }, { getLogger }, eventService);
    const accessService = new services_1.AccessService({ accessStore, accountStore, roleStore, environmentStore, groupStore }, { getLogger }, groupService, eventService);
    const segmentService = (0, createSegmentService_1.createFakeSegmentService)(config);
    const changeRequestAccessReadModel = (0, createChangeRequestAccessReadModel_1.createFakeChangeRequestAccessService)();
    const fakePrivateProjectChecker = (0, createPrivateProjectChecker_1.createFakePrivateProjectChecker)();
    const dependentFeaturesReadModel = new fake_dependent_features_read_model_1.FakeDependentFeaturesReadModel();
    const dependentFeaturesService = (0, createDependentFeaturesService_1.createFakeDependentFeaturesService)(config);
    const featureLifecycleReadModel = new fake_feature_lifecycle_read_model_1.FakeFeatureLifecycleReadModel();
    const featureCollaboratorsReadModel = new fake_feature_collaborators_read_model_1.FakeFeatureCollaboratorsReadModel();
    const featureToggleService = new services_1.FeatureToggleService({
        featureStrategiesStore,
        featureToggleStore,
        clientFeatureToggleStore: featureToggleClientStore,
        projectStore,
        featureTagStore,
        featureEnvironmentStore,
        contextFieldStore,
        strategyStore,
    }, {
        getLogger,
        flagResolver,
        eventBus: new stream_1.EventEmitter(),
        resourceLimits,
    }, segmentService, accessService, eventService, changeRequestAccessReadModel, fakePrivateProjectChecker, dependentFeaturesReadModel, dependentFeaturesService, featureLifecycleReadModel, featureCollaboratorsReadModel);
    return {
        featureToggleService,
        featureToggleStore,
        projectStore,
        featureStrategiesStore,
    };
};
exports.createFakeFeatureToggleService = createFakeFeatureToggleService;
//# sourceMappingURL=createFeatureToggleService.js.map