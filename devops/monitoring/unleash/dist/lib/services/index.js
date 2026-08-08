"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSubscriptionsService = exports.ProjectStatusService = exports.PersonalDashboardService = exports.OnboardingService = exports.IntegrationEventsService = exports.FeatureLifecycleService = exports.JobService = exports.ProjectInsightsService = exports.FeatureSearchService = exports.ClientFeatureToggleService = exports.DependentFeaturesService = exports.SchedulerService = exports.FavoritesService = exports.InstanceStatsService = exports.LastSeenService = exports.PublicSignupTokenService = exports.PatService = exports.EdgeService = exports.FrontendApiService = exports.GroupService = exports.PlaygroundService = exports.ClientSpecService = exports.OpenApiService = exports.SegmentService = exports.UserSplashService = exports.ProjectHealthService = exports.FeatureTagService = exports.EnvironmentService = exports.FeatureToggleService = exports.UserFeedbackService = exports.SessionService = exports.SettingService = exports.ResetTokenService = exports.UserService = exports.ApiTokenService = exports.AccessService = exports.EmailService = exports.VersionService = exports.ContextService = exports.AddonService = exports.StrategyService = exports.TagService = exports.TagTypeService = exports.ClientMetricsServiceV2 = exports.ClientInstanceService = exports.ProjectService = exports.HealthService = exports.EventService = exports.FeatureTypeService = exports.createServices = void 0;
exports.UniqueConnectionService = void 0;
const feature_type_service_1 = __importDefault(require("./feature-type-service"));
exports.FeatureTypeService = feature_type_service_1.default;
const event_service_1 = __importDefault(require("../features/events/event-service"));
exports.EventService = event_service_1.default;
const health_service_1 = __importDefault(require("./health-service"));
exports.HealthService = health_service_1.default;
const project_service_1 = __importDefault(require("../features/project/project-service"));
exports.ProjectService = project_service_1.default;
const instance_service_1 = __importDefault(require("../features/metrics/instance/instance-service"));
exports.ClientInstanceService = instance_service_1.default;
const metrics_service_v2_1 = __importDefault(require("../features/metrics/client-metrics/metrics-service-v2"));
exports.ClientMetricsServiceV2 = metrics_service_v2_1.default;
const tag_type_service_1 = __importDefault(require("../features/tag-type/tag-type-service"));
exports.TagTypeService = tag_type_service_1.default;
const tag_service_1 = __importDefault(require("./tag-service"));
exports.TagService = tag_service_1.default;
const strategy_service_1 = __importDefault(require("./strategy-service"));
exports.StrategyService = strategy_service_1.default;
const addon_service_1 = __importDefault(require("./addon-service"));
exports.AddonService = addon_service_1.default;
const context_service_1 = __importDefault(require("../features/context/context-service"));
exports.ContextService = context_service_1.default;
const version_service_1 = __importDefault(require("./version-service"));
exports.VersionService = version_service_1.default;
const email_service_1 = require("./email-service");
Object.defineProperty(exports, "EmailService", { enumerable: true, get: function () { return email_service_1.EmailService; } });
const access_service_1 = require("./access-service");
Object.defineProperty(exports, "AccessService", { enumerable: true, get: function () { return access_service_1.AccessService; } });
const api_token_service_1 = require("./api-token-service");
Object.defineProperty(exports, "ApiTokenService", { enumerable: true, get: function () { return api_token_service_1.ApiTokenService; } });
const user_service_1 = __importDefault(require("./user-service"));
exports.UserService = user_service_1.default;
const reset_token_service_1 = __importDefault(require("./reset-token-service"));
exports.ResetTokenService = reset_token_service_1.default;
const setting_service_1 = __importDefault(require("./setting-service"));
exports.SettingService = setting_service_1.default;
const session_service_1 = __importDefault(require("./session-service"));
exports.SessionService = session_service_1.default;
const user_feedback_service_1 = __importDefault(require("./user-feedback-service"));
exports.UserFeedbackService = user_feedback_service_1.default;
const feature_toggle_service_1 = __importDefault(require("../features/feature-toggle/feature-toggle-service"));
exports.FeatureToggleService = feature_toggle_service_1.default;
const environment_service_1 = __importDefault(require("../features/project-environments/environment-service"));
exports.EnvironmentService = environment_service_1.default;
const feature_tag_service_1 = __importDefault(require("./feature-tag-service"));
exports.FeatureTagService = feature_tag_service_1.default;
const project_health_service_1 = __importDefault(require("./project-health-service"));
exports.ProjectHealthService = project_health_service_1.default;
const user_splash_service_1 = __importDefault(require("./user-splash-service"));
exports.UserSplashService = user_splash_service_1.default;
const segment_service_1 = require("../features/segment/segment-service");
Object.defineProperty(exports, "SegmentService", { enumerable: true, get: function () { return segment_service_1.SegmentService; } });
const openapi_service_1 = require("./openapi-service");
Object.defineProperty(exports, "OpenApiService", { enumerable: true, get: function () { return openapi_service_1.OpenApiService; } });
const client_spec_service_1 = require("./client-spec-service");
Object.defineProperty(exports, "ClientSpecService", { enumerable: true, get: function () { return client_spec_service_1.ClientSpecService; } });
const playground_service_1 = require("../features/playground/playground-service");
Object.defineProperty(exports, "PlaygroundService", { enumerable: true, get: function () { return playground_service_1.PlaygroundService; } });
const group_service_1 = require("./group-service");
Object.defineProperty(exports, "GroupService", { enumerable: true, get: function () { return group_service_1.GroupService; } });
const frontend_api_service_1 = require("../features/frontend-api/frontend-api-service");
Object.defineProperty(exports, "FrontendApiService", { enumerable: true, get: function () { return frontend_api_service_1.FrontendApiService; } });
const edge_service_1 = __importDefault(require("./edge-service"));
exports.EdgeService = edge_service_1.default;
const pat_service_1 = __importDefault(require("./pat-service"));
exports.PatService = pat_service_1.default;
const public_signup_token_service_1 = require("./public-signup-token-service");
Object.defineProperty(exports, "PublicSignupTokenService", { enumerable: true, get: function () { return public_signup_token_service_1.PublicSignupTokenService; } });
const last_seen_service_1 = require("../features/metrics/last-seen/last-seen-service");
Object.defineProperty(exports, "LastSeenService", { enumerable: true, get: function () { return last_seen_service_1.LastSeenService; } });
const instance_stats_service_1 = require("../features/instance-stats/instance-stats-service");
Object.defineProperty(exports, "InstanceStatsService", { enumerable: true, get: function () { return instance_stats_service_1.InstanceStatsService; } });
const favorites_service_1 = require("./favorites-service");
Object.defineProperty(exports, "FavoritesService", { enumerable: true, get: function () { return favorites_service_1.FavoritesService; } });
const maintenance_service_1 = __importDefault(require("../features/maintenance/maintenance-service"));
const account_service_1 = require("./account-service");
const scheduler_service_1 = require("../features/scheduler/scheduler-service");
Object.defineProperty(exports, "SchedulerService", { enumerable: true, get: function () { return scheduler_service_1.SchedulerService; } });
const project_insights_service_1 = require("../features/project-insights/project-insights-service");
Object.defineProperty(exports, "ProjectInsightsService", { enumerable: true, get: function () { return project_insights_service_1.ProjectInsightsService; } });
const createExportImportService_1 = require("../features/export-import-toggles/createExportImportService");
const transaction_1 = require("../db/transaction");
const createChangeRequestAccessReadModel_1 = require("../features/change-request-access-service/createChangeRequestAccessReadModel");
const createChangeRequestSegmentUsageReadModel_1 = require("../features/change-request-segment-usage-service/createChangeRequestSegmentUsageReadModel");
const configuration_revision_service_1 = __importDefault(require("../features/feature-toggle/configuration-revision-service"));
const features_1 = require("../features");
const event_announcer_service_1 = __importDefault(require("./event-announcer-service"));
const createGroupService_1 = require("../features/group/createGroupService");
const createPrivateProjectChecker_1 = require("../features/private-project/createPrivateProjectChecker");
const dependent_features_service_1 = require("../features/dependent-features/dependent-features-service");
Object.defineProperty(exports, "DependentFeaturesService", { enumerable: true, get: function () { return dependent_features_service_1.DependentFeaturesService; } });
const createDependentFeaturesService_1 = require("../features/dependent-features/createDependentFeaturesService");
const dependent_features_read_model_1 = require("../features/dependent-features/dependent-features-read-model");
const fake_dependent_features_read_model_1 = require("../features/dependent-features/fake-dependent-features-read-model");
const createLastSeenService_1 = require("../features/metrics/last-seen/createLastSeenService");
const createClientFeatureToggleService_1 = require("../features/client-feature-toggles/createClientFeatureToggleService");
const client_feature_toggle_service_1 = require("../features/client-feature-toggles/client-feature-toggle-service");
Object.defineProperty(exports, "ClientFeatureToggleService", { enumerable: true, get: function () { return client_feature_toggle_service_1.ClientFeatureToggleService; } });
const createFeatureSearchService_1 = require("../features/feature-search/createFeatureSearchService");
const feature_search_service_1 = require("../features/feature-search/feature-search-service");
Object.defineProperty(exports, "FeatureSearchService", { enumerable: true, get: function () { return feature_search_service_1.FeatureSearchService; } });
const createTagTypeService_1 = require("../features/tag-type/createTagTypeService");
const createInstanceStatsService_1 = require("../features/instance-stats/createInstanceStatsService");
const inactive_users_service_1 = require("../users/inactive/inactive-users-service");
const createFrontendApiService_1 = require("../features/frontend-api/createFrontendApiService");
const createProjectInsightsService_1 = require("../features/project-insights/createProjectInsightsService");
const job_service_1 = require("../features/scheduler/job-service");
Object.defineProperty(exports, "JobService", { enumerable: true, get: function () { return job_service_1.JobService; } });
const user_subscriptions_service_1 = require("../features/user-subscriptions/user-subscriptions-service");
Object.defineProperty(exports, "UserSubscriptionsService", { enumerable: true, get: function () { return user_subscriptions_service_1.UserSubscriptionsService; } });
const job_store_1 = require("../features/scheduler/job-store");
const feature_lifecycle_service_1 = require("../features/feature-lifecycle/feature-lifecycle-service");
Object.defineProperty(exports, "FeatureLifecycleService", { enumerable: true, get: function () { return feature_lifecycle_service_1.FeatureLifecycleService; } });
const createFeatureLifecycle_1 = require("../features/feature-lifecycle/createFeatureLifecycle");
const feature_lifecycle_read_model_1 = require("../features/feature-lifecycle/feature-lifecycle-read-model");
const fake_feature_lifecycle_read_model_1 = require("../features/feature-lifecycle/fake-feature-lifecycle-read-model");
const createApiTokenService_1 = require("../features/api-tokens/createApiTokenService");
const integration_events_service_1 = require("../features/integration-events/integration-events-service");
Object.defineProperty(exports, "IntegrationEventsService", { enumerable: true, get: function () { return integration_events_service_1.IntegrationEventsService; } });
const feature_collaborators_read_model_1 = require("../features/feature-toggle/feature-collaborators-read-model");
const fake_feature_collaborators_read_model_1 = require("../features/feature-toggle/fake-feature-collaborators-read-model");
const createPlaygroundService_1 = require("../features/playground/createPlaygroundService");
const createOnboardingService_1 = require("../features/onboarding/createOnboardingService");
const onboarding_service_1 = require("../features/onboarding/onboarding-service");
Object.defineProperty(exports, "OnboardingService", { enumerable: true, get: function () { return onboarding_service_1.OnboardingService; } });
const personal_dashboard_service_1 = require("../features/personal-dashboard/personal-dashboard-service");
Object.defineProperty(exports, "PersonalDashboardService", { enumerable: true, get: function () { return personal_dashboard_service_1.PersonalDashboardService; } });
const createPersonalDashboardService_1 = require("../features/personal-dashboard/createPersonalDashboardService");
const createProjectStatusService_1 = require("../features/project-status/createProjectStatusService");
const project_status_service_1 = require("../features/project-status/project-status-service");
Object.defineProperty(exports, "ProjectStatusService", { enumerable: true, get: function () { return project_status_service_1.ProjectStatusService; } });
const createContextService_1 = require("../features/context/createContextService");
const unique_connection_service_1 = require("../features/unique-connection/unique-connection-service");
Object.defineProperty(exports, "UniqueConnectionService", { enumerable: true, get: function () { return unique_connection_service_1.UniqueConnectionService; } });
const createServices = (stores, config, db) => {
    const privateProjectChecker = db
        ? (0, createPrivateProjectChecker_1.createPrivateProjectChecker)(db, config)
        : (0, createPrivateProjectChecker_1.createFakePrivateProjectChecker)();
    const eventService = db
        ? (0, features_1.createEventsService)(db, config)
        : (0, features_1.createFakeEventsService)(config, stores);
    const groupService = new group_service_1.GroupService(stores, config, eventService);
    const transactionalAccessService = db
        ? (0, transaction_1.withTransactional)((db) => (0, features_1.createAccessService)(db, config), db)
        : (0, transaction_1.withFakeTransactional)((0, features_1.createFakeAccessService)(config).accessService);
    const accessService = new access_service_1.AccessService(stores, config, groupService, eventService);
    const apiTokenService = db
        ? (0, createApiTokenService_1.createApiTokenService)(db, config)
        : (0, createApiTokenService_1.createFakeApiTokenService)(config).apiTokenService;
    const lastSeenService = db
        ? (0, createLastSeenService_1.createLastSeenService)(db, config)
        : (0, createLastSeenService_1.createFakeLastSeenService)(config);
    const clientMetricsServiceV2 = new metrics_service_v2_1.default(stores, config, lastSeenService);
    const dependentFeaturesReadModel = db
        ? new dependent_features_read_model_1.DependentFeaturesReadModel(db)
        : new fake_dependent_features_read_model_1.FakeDependentFeaturesReadModel();
    const featureLifecycleReadModel = db
        ? new feature_lifecycle_read_model_1.FeatureLifecycleReadModel(db, config.flagResolver)
        : new fake_feature_lifecycle_read_model_1.FakeFeatureLifecycleReadModel();
    const transactionalContextService = db
        ? (0, transaction_1.withTransactional)((0, createContextService_1.createContextService)(config), db)
        : (0, transaction_1.withFakeTransactional)((0, createContextService_1.createFakeContextService)(config));
    const contextService = transactionalContextService;
    const emailService = new email_service_1.EmailService(config);
    const featureTypeService = new feature_type_service_1.default(stores, config, eventService);
    const resetTokenService = new reset_token_service_1.default(stores, config);
    const strategyService = new strategy_service_1.default(stores, config, eventService);
    const tagService = new tag_service_1.default(stores, config, eventService);
    const transactionalTagTypeService = db
        ? (0, transaction_1.withTransactional)((0, createTagTypeService_1.createTagTypeService)(config), db)
        : (0, transaction_1.withFakeTransactional)((0, createTagTypeService_1.createFakeTagTypeService)(config));
    const tagTypeService = transactionalTagTypeService;
    const integrationEventsService = new integration_events_service_1.IntegrationEventsService(stores, config);
    const addonService = new addon_service_1.default(stores, config, tagTypeService, eventService, integrationEventsService);
    const sessionService = new session_service_1.default(stores, config);
    const settingService = new setting_service_1.default(stores, config, eventService);
    const userService = new user_service_1.default(stores, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
    });
    const accountService = new account_service_1.AccountService(stores, config, {
        accessService,
    });
    const versionService = new version_service_1.default(stores, config);
    const healthService = new health_service_1.default(stores, config);
    const userFeedbackService = new user_feedback_service_1.default(stores, config);
    const changeRequestAccessReadModel = db
        ? (0, createChangeRequestAccessReadModel_1.createChangeRequestAccessReadModel)(db, config)
        : (0, createChangeRequestAccessReadModel_1.createFakeChangeRequestAccessService)();
    const changeRequestSegmentUsageReadModel = db
        ? (0, createChangeRequestSegmentUsageReadModel_1.createChangeRequestSegmentUsageReadModel)(db)
        : (0, createChangeRequestSegmentUsageReadModel_1.createFakeChangeRequestSegmentUsageReadModel)();
    const segmentService = new segment_service_1.SegmentService(stores, changeRequestAccessReadModel, changeRequestSegmentUsageReadModel, config, eventService, privateProjectChecker);
    const clientInstanceService = new instance_service_1.default(stores, config, privateProjectChecker);
    const transactionalDependentFeaturesService = db
        ? (0, transaction_1.withTransactional)((0, createDependentFeaturesService_1.createDependentFeaturesService)(config), db)
        : (0, transaction_1.withFakeTransactional)((0, createDependentFeaturesService_1.createFakeDependentFeaturesService)(config));
    const dependentFeaturesService = transactionalDependentFeaturesService;
    const featureSearchService = db
        ? (0, createFeatureSearchService_1.createFeatureSearchService)(config)(db)
        : (0, createFeatureSearchService_1.createFakeFeatureSearchService)(config);
    const featureCollaboratorsReadModel = db
        ? new feature_collaborators_read_model_1.FeatureCollaboratorsReadModel(db)
        : new fake_feature_collaborators_read_model_1.FakeFeatureCollaboratorsReadModel();
    const featureToggleService = new feature_toggle_service_1.default(stores, config, segmentService, accessService, eventService, changeRequestAccessReadModel, privateProjectChecker, dependentFeaturesReadModel, dependentFeaturesService, featureLifecycleReadModel, featureCollaboratorsReadModel);
    const transactionalEnvironmentService = db
        ? (0, transaction_1.withTransactional)((0, features_1.createEnvironmentService)(config), db)
        : (0, transaction_1.withFakeTransactional)((0, features_1.createFakeEnvironmentService)(config));
    const environmentService = transactionalEnvironmentService;
    const featureTagService = new feature_tag_service_1.default(stores, config, eventService);
    const favoritesService = new favorites_service_1.FavoritesService(stores, config, eventService);
    const projectService = db
        ? (0, features_1.createProjectService)(db, config)
        : (0, features_1.createFakeProjectService)(config);
    const transactionalProjectService = db
        ? (0, transaction_1.withTransactional)((db) => (0, features_1.createProjectService)(db, config), db)
        : (0, transaction_1.withFakeTransactional)((0, features_1.createFakeProjectService)(config));
    const projectInsightsService = db
        ? (0, createProjectInsightsService_1.createProjectInsightsService)(db, config)
        : (0, createProjectInsightsService_1.createFakeProjectInsightsService)().projectInsightsService;
    const projectStatusService = db
        ? (0, createProjectStatusService_1.createProjectStatusService)(db, config)
        : (0, createProjectStatusService_1.createFakeProjectStatusService)().projectStatusService;
    const projectHealthService = new project_health_service_1.default(stores, config, projectService);
    const exportImportService = db
        ? (0, createExportImportService_1.createExportImportTogglesService)(db, config)
        : (0, createExportImportService_1.createFakeExportImportTogglesService)(config);
    const importService = db
        ? (0, transaction_1.withTransactional)((0, createExportImportService_1.deferredExportImportTogglesService)(config), db)
        : (0, transaction_1.withFakeTransactional)((0, createExportImportService_1.createFakeExportImportTogglesService)(config));
    const transactionalFeatureToggleService = (txDb) => (0, features_1.createFeatureToggleService)(txDb, config);
    const transactionalGroupService = (txDb) => (0, createGroupService_1.createGroupService)(txDb, config);
    const userSplashService = new user_splash_service_1.default(stores, config);
    const openApiService = new openapi_service_1.OpenApiService(config);
    const clientSpecService = new client_spec_service_1.ClientSpecService(config);
    const playgroundService = db
        ? (0, createPlaygroundService_1.createPlaygroundService)(db, config)
        : (0, createPlaygroundService_1.createFakePlaygroundService)(config);
    const configurationRevisionService = configuration_revision_service_1.default.getInstance(stores, config);
    const clientFeatureToggleService = db
        ? (0, createClientFeatureToggleService_1.createClientFeatureToggleService)(db, config)
        : (0, createClientFeatureToggleService_1.createFakeClientFeatureToggleService)(config);
    const frontendApiService = db
        ? (0, createFrontendApiService_1.createFrontendApiService)(db, config, clientMetricsServiceV2, configurationRevisionService)
        : (0, createFrontendApiService_1.createFakeFrontendApiService)(config, clientMetricsServiceV2, configurationRevisionService);
    const edgeService = new edge_service_1.default({ apiTokenService }, config);
    const patService = new pat_service_1.default(stores, config, eventService);
    const publicSignupTokenService = new public_signup_token_service_1.PublicSignupTokenService(stores, config, userService, eventService);
    const instanceStatsService = db
        ? (0, createInstanceStatsService_1.createInstanceStatsService)(db, config)
        : (0, createInstanceStatsService_1.createFakeInstanceStatsService)(config);
    const maintenanceService = new maintenance_service_1.default(config, settingService);
    const schedulerService = new scheduler_service_1.SchedulerService(config.getLogger, maintenanceService, config.eventBus);
    const eventAnnouncerService = new event_announcer_service_1.default(stores, config);
    const inactiveUsersService = new inactive_users_service_1.InactiveUsersService(stores, config, {
        userService,
    });
    const jobService = new job_service_1.JobService(new job_store_1.JobStore(db, config), config.getLogger);
    const transactionalFeatureLifecycleService = db
        ? (0, transaction_1.withTransactional)((0, features_1.createFeatureLifecycleService)(config), db)
        : (0, transaction_1.withFakeTransactional)((0, createFeatureLifecycle_1.createFakeFeatureLifecycleService)(config).featureLifecycleService);
    const featureLifecycleService = transactionalFeatureLifecycleService;
    featureLifecycleService.listen();
    const uniqueConnectionService = new unique_connection_service_1.UniqueConnectionService(stores, config);
    uniqueConnectionService.listen();
    const onboardingService = db
        ? (0, createOnboardingService_1.createOnboardingService)(config)(db)
        : (0, createOnboardingService_1.createFakeOnboardingService)(config).onboardingService;
    onboardingService.listen();
    const personalDashboardService = db
        ? (0, createPersonalDashboardService_1.createPersonalDashboardService)(db, config, stores)
        : (0, createPersonalDashboardService_1.createFakePersonalDashboardService)(config);
    const transactionalUserSubscriptionsService = db
        ? (0, transaction_1.withTransactional)((0, features_1.createUserSubscriptionsService)(config), db)
        : (0, transaction_1.withFakeTransactional)((0, features_1.createFakeUserSubscriptionsService)(config));
    return {
        transactionalAccessService,
        accessService,
        accountService,
        addonService,
        eventAnnouncerService,
        featureToggleService,
        featureTypeService,
        healthService,
        projectService,
        transactionalProjectService,
        strategyService,
        tagTypeService,
        transactionalTagTypeService,
        tagService,
        clientInstanceService,
        clientMetricsServiceV2,
        contextService,
        transactionalContextService,
        versionService,
        apiTokenService,
        emailService,
        userService,
        resetTokenService,
        eventService,
        environmentService,
        transactionalEnvironmentService,
        settingService,
        sessionService,
        userFeedbackService,
        featureTagService,
        projectHealthService,
        userSplashService,
        segmentService,
        openApiService,
        clientSpecService,
        playgroundService,
        groupService,
        frontendApiService,
        edgeService,
        patService,
        publicSignupTokenService,
        lastSeenService,
        instanceStatsService,
        favoritesService,
        maintenanceService,
        exportService: exportImportService,
        importService,
        schedulerService,
        configurationRevisionService,
        transactionalFeatureToggleService,
        transactionalGroupService,
        privateProjectChecker,
        dependentFeaturesService,
        transactionalDependentFeaturesService,
        clientFeatureToggleService,
        featureSearchService,
        inactiveUsersService,
        projectInsightsService,
        jobService,
        featureLifecycleService,
        transactionalFeatureLifecycleService,
        integrationEventsService,
        onboardingService,
        personalDashboardService,
        projectStatusService,
        transactionalUserSubscriptionsService,
        uniqueConnectionService,
    };
};
exports.createServices = createServices;
//# sourceMappingURL=index.js.map