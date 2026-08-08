"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeProjectService = exports.createProjectService = void 0;
const event_store_1 = __importDefault(require("../events/event-store"));
const group_store_1 = __importDefault(require("../../db/group-store"));
const account_store_1 = require("../../db/account-store");
const environment_store_1 = __importDefault(require("../project-environments/environment-store"));
const services_1 = require("../../services");
const fake_group_store_1 = __importDefault(require("../../../test/fixtures/fake-group-store"));
const fake_event_store_1 = __importDefault(require("../../../test/fixtures/fake-event-store"));
const project_store_1 = __importDefault(require("./project-store"));
const feature_toggle_store_1 = __importDefault(require("../feature-toggle/feature-toggle-store"));
const feature_environment_store_1 = require("../../db/feature-environment-store");
const project_stats_store_1 = __importDefault(require("../../db/project-stats-store"));
const createAccessService_1 = require("../access/createAccessService");
const createFeatureToggleService_1 = require("../feature-toggle/createFeatureToggleService");
const favorite_features_store_1 = require("../../db/favorite-features-store");
const favorite_projects_store_1 = require("../../db/favorite-projects-store");
const fake_project_store_1 = __importDefault(require("../../../test/fixtures/fake-project-store"));
const fake_feature_toggle_store_1 = __importDefault(require("../feature-toggle/fakes/fake-feature-toggle-store"));
const fake_environment_store_1 = __importDefault(require("../project-environments/fake-environment-store"));
const fake_feature_environment_store_1 = __importDefault(require("../../../test/fixtures/fake-feature-environment-store"));
const fake_project_stats_store_1 = __importDefault(require("../../../test/fixtures/fake-project-stats-store"));
const fake_favorite_features_store_1 = __importDefault(require("../../../test/fixtures/fake-favorite-features-store"));
const fake_favorite_projects_store_1 = __importDefault(require("../../../test/fixtures/fake-favorite-projects-store"));
const fake_account_store_1 = require("../../../test/fixtures/fake-account-store");
const createPrivateProjectChecker_1 = require("../private-project/createPrivateProjectChecker");
const project_owners_read_model_1 = require("./project-owners-read-model");
const fake_project_owners_read_model_1 = require("./fake-project-owners-read-model");
const fake_project_flag_creators_read_model_1 = require("./fake-project-flag-creators-read-model");
const project_flag_creators_read_model_1 = require("./project-flag-creators-read-model");
const fake_api_token_store_1 = __importDefault(require("../../../test/fixtures/fake-api-token-store"));
const api_token_store_1 = require("../../db/api-token-store");
const createEventsService_1 = require("../events/createEventsService");
const createProjectReadModel_1 = require("./createProjectReadModel");
const createOnboardingReadModel_1 = require("../onboarding/createOnboardingReadModel");
const createProjectService = (db, config) => {
    const { eventBus, getLogger, flagResolver } = config;
    const eventStore = new event_store_1.default(db, getLogger);
    const projectStore = new project_store_1.default(db, eventBus, config);
    const projectOwnersReadModel = new project_owners_read_model_1.ProjectOwnersReadModel(db);
    const projectFlagCreatorsReadModel = new project_flag_creators_read_model_1.ProjectFlagCreatorsReadModel(db);
    const groupStore = new group_store_1.default(db);
    const featureToggleStore = new feature_toggle_store_1.default(db, eventBus, getLogger, flagResolver);
    const accountStore = new account_store_1.AccountStore(db, getLogger);
    const environmentStore = new environment_store_1.default(db, eventBus, config);
    const featureEnvironmentStore = new feature_environment_store_1.FeatureEnvironmentStore(db, eventBus, config);
    const projectStatsStore = new project_stats_store_1.default(db, eventBus, getLogger);
    const accessService = (0, createAccessService_1.createAccessService)(db, config);
    const featureToggleService = (0, createFeatureToggleService_1.createFeatureToggleService)(db, config);
    const favoriteFeaturesStore = new favorite_features_store_1.FavoriteFeaturesStore(db, eventBus, getLogger);
    const favoriteProjectsStore = new favorite_projects_store_1.FavoriteProjectsStore(db, eventBus, getLogger);
    const eventService = (0, createEventsService_1.createEventsService)(db, config);
    const favoriteService = new services_1.FavoritesService({
        favoriteFeaturesStore,
        favoriteProjectsStore,
    }, config, eventService);
    const groupService = new services_1.GroupService({ groupStore, accountStore }, { getLogger }, eventService);
    const apiTokenStore = new api_token_store_1.ApiTokenStore(db, eventBus, getLogger, flagResolver);
    const privateProjectChecker = (0, createPrivateProjectChecker_1.createPrivateProjectChecker)(db, config);
    const apiTokenService = new services_1.ApiTokenService({ apiTokenStore, environmentStore }, config, eventService);
    const projectReadModel = (0, createProjectReadModel_1.createProjectReadModel)(db, eventBus, config.flagResolver);
    const onboardingReadModel = (0, createOnboardingReadModel_1.createOnboardingReadModel)(db);
    return new services_1.ProjectService({
        projectStore,
        eventStore,
        featureToggleStore,
        environmentStore,
        featureEnvironmentStore,
        accountStore,
        projectStatsStore,
        projectOwnersReadModel,
        projectFlagCreatorsReadModel,
        projectReadModel,
        onboardingReadModel,
    }, config, accessService, featureToggleService, groupService, favoriteService, eventService, privateProjectChecker, apiTokenService);
};
exports.createProjectService = createProjectService;
const createFakeProjectService = (config) => {
    const { getLogger } = config;
    const eventStore = new fake_event_store_1.default();
    const projectOwnersReadModel = new fake_project_owners_read_model_1.FakeProjectOwnersReadModel();
    const projectFlagCreatorsReadModel = new fake_project_flag_creators_read_model_1.FakeProjectFlagCreatorsReadModel();
    const projectStore = new fake_project_store_1.default();
    const groupStore = new fake_group_store_1.default();
    const featureToggleStore = new fake_feature_toggle_store_1.default();
    const accountStore = new fake_account_store_1.FakeAccountStore();
    const environmentStore = new fake_environment_store_1.default();
    const featureEnvironmentStore = new fake_feature_environment_store_1.default();
    const projectStatsStore = new fake_project_stats_store_1.default();
    const { accessService } = (0, createAccessService_1.createFakeAccessService)(config);
    const { featureToggleService } = (0, createFeatureToggleService_1.createFakeFeatureToggleService)(config);
    const favoriteFeaturesStore = new fake_favorite_features_store_1.default();
    const favoriteProjectsStore = new fake_favorite_projects_store_1.default();
    const apiTokenStore = new fake_api_token_store_1.default();
    const privateProjectChecker = (0, createPrivateProjectChecker_1.createFakePrivateProjectChecker)();
    const eventService = (0, createEventsService_1.createFakeEventsService)(config);
    const favoriteService = new services_1.FavoritesService({
        favoriteFeaturesStore,
        favoriteProjectsStore,
    }, config, eventService);
    const groupService = new services_1.GroupService({ groupStore, accountStore }, { getLogger }, eventService);
    const apiTokenService = new services_1.ApiTokenService({ apiTokenStore, environmentStore }, config, eventService);
    const projectReadModel = (0, createProjectReadModel_1.createFakeProjectReadModel)();
    const onboardingReadModel = (0, createOnboardingReadModel_1.createFakeOnboardingReadModel)();
    return new services_1.ProjectService({
        projectStore,
        projectOwnersReadModel,
        projectFlagCreatorsReadModel,
        eventStore,
        featureToggleStore,
        environmentStore,
        featureEnvironmentStore,
        accountStore,
        projectStatsStore,
        projectReadModel,
        onboardingReadModel,
    }, config, accessService, featureToggleService, groupService, favoriteService, eventService, privateProjectChecker, apiTokenService);
};
exports.createFakeProjectService = createFakeProjectService;
//# sourceMappingURL=createProjectService.js.map