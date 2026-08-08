"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStores = void 0;
const event_store_1 = __importDefault(require("../features/events/event-store"));
const feature_toggle_store_1 = __importDefault(require("../features/feature-toggle/feature-toggle-store"));
const feature_type_store_1 = __importDefault(require("./feature-type-store"));
const strategy_store_1 = __importDefault(require("./strategy-store"));
const client_instance_store_1 = __importDefault(require("./client-instance-store"));
const client_applications_store_1 = __importDefault(require("./client-applications-store"));
const context_field_store_1 = __importDefault(require("../features/context/context-field-store"));
const setting_store_1 = __importDefault(require("./setting-store"));
const user_store_1 = __importDefault(require("./user-store"));
const project_store_1 = __importDefault(require("../features/project/project-store"));
const tag_store_1 = __importDefault(require("./tag-store"));
const tag_type_store_1 = __importDefault(require("../features/tag-type/tag-type-store"));
const addon_store_1 = __importDefault(require("./addon-store"));
const api_token_store_1 = require("./api-token-store");
const session_store_1 = __importDefault(require("./session-store"));
const access_store_1 = require("./access-store");
const reset_token_store_1 = require("./reset-token-store");
const user_feedback_store_1 = __importDefault(require("./user-feedback-store"));
const feature_toggle_strategies_store_1 = __importDefault(require("../features/feature-toggle/feature-toggle-strategies-store"));
const client_feature_toggle_store_1 = __importDefault(require("../features/client-feature-toggles/client-feature-toggle-store"));
const environment_store_1 = __importDefault(require("../features/project-environments/environment-store"));
const feature_tag_store_1 = __importDefault(require("./feature-tag-store"));
const feature_environment_store_1 = require("./feature-environment-store");
const client_metrics_store_v2_1 = require("../features/metrics/client-metrics/client-metrics-store-v2");
const user_splash_store_1 = __importDefault(require("./user-splash-store"));
const role_store_1 = __importDefault(require("./role-store"));
const segment_store_1 = __importDefault(require("../features/segment/segment-store"));
const group_store_1 = __importDefault(require("./group-store"));
const pat_store_1 = __importDefault(require("./pat-store"));
const public_signup_token_store_1 = require("./public-signup-token-store");
const favorite_features_store_1 = require("./favorite-features-store");
const favorite_projects_store_1 = require("./favorite-projects-store");
const account_store_1 = require("./account-store");
const project_stats_store_1 = __importDefault(require("./project-stats-store"));
const import_toggles_store_1 = require("../features/export-import-toggles/import-toggles-store");
const privateProjectStore_1 = __importDefault(require("../features/private-project/privateProjectStore"));
const dependent_features_store_1 = require("../features/dependent-features/dependent-features-store");
const last_seen_store_1 = __importDefault(require("../features/metrics/last-seen/last-seen-store"));
const feature_search_store_1 = __importDefault(require("../features/feature-search/feature-search-store"));
const inactive_users_store_1 = require("../users/inactive/inactive-users-store");
const traffic_data_usage_store_1 = require("../features/traffic-data-usage/traffic-data-usage-store");
const segment_read_model_1 = require("../features/segment/segment-read-model");
const project_owners_read_model_1 = require("../features/project/project-owners-read-model");
const feature_lifecycle_store_1 = require("../features/feature-lifecycle/feature-lifecycle-store");
const project_flag_creators_read_model_1 = require("../features/project/project-flag-creators-read-model");
const feature_strategies_read_model_1 = require("../features/feature-toggle/feature-strategies-read-model");
const feature_lifecycle_read_model_1 = require("../features/feature-lifecycle/feature-lifecycle-read-model");
const largest_resources_read_model_1 = require("../features/metrics/sizes/largest-resources-read-model");
const integration_events_store_1 = require("../features/integration-events/integration-events-store");
const feature_collaborators_read_model_1 = require("../features/feature-toggle/feature-collaborators-read-model");
const createProjectReadModel_1 = require("../features/project/createProjectReadModel");
const onboarding_store_1 = require("../features/onboarding/onboarding-store");
const createOnboardingReadModel_1 = require("../features/onboarding/createOnboardingReadModel");
const user_unsubscribe_store_1 = require("../features/user-subscriptions/user-unsubscribe-store");
const user_subscriptions_read_model_1 = require("../features/user-subscriptions/user-subscriptions-read-model");
const unique_connection_store_1 = require("../features/unique-connection/unique-connection-store");
const unique_connection_read_model_1 = require("../features/unique-connection/unique-connection-read-model");
const createStores = (config, db) => {
    const { getLogger, eventBus } = config;
    const eventStore = new event_store_1.default(db, getLogger);
    return {
        eventStore,
        featureToggleStore: new feature_toggle_store_1.default(db, eventBus, getLogger, config.flagResolver),
        featureTypeStore: new feature_type_store_1.default(db, getLogger),
        strategyStore: new strategy_store_1.default(db, getLogger),
        clientApplicationsStore: new client_applications_store_1.default(db, eventBus, getLogger, config.flagResolver),
        clientInstanceStore: new client_instance_store_1.default(db, eventBus, getLogger),
        clientMetricsStoreV2: new client_metrics_store_v2_1.ClientMetricsStoreV2(db, getLogger, config.flagResolver),
        contextFieldStore: new context_field_store_1.default(db, getLogger, config.flagResolver),
        settingStore: new setting_store_1.default(db, getLogger),
        userStore: new user_store_1.default(db, getLogger, config.flagResolver),
        accountStore: new account_store_1.AccountStore(db, getLogger),
        projectStore: new project_store_1.default(db, eventBus, config),
        tagStore: new tag_store_1.default(db, eventBus, getLogger),
        tagTypeStore: new tag_type_store_1.default(db, eventBus, getLogger),
        addonStore: new addon_store_1.default(db, eventBus, getLogger),
        accessStore: new access_store_1.AccessStore(db, eventBus, getLogger),
        apiTokenStore: new api_token_store_1.ApiTokenStore(db, eventBus, getLogger, config.flagResolver),
        resetTokenStore: new reset_token_store_1.ResetTokenStore(db, eventBus, getLogger),
        sessionStore: new session_store_1.default(db, eventBus, getLogger),
        userFeedbackStore: new user_feedback_store_1.default(db, eventBus, getLogger),
        featureStrategiesStore: new feature_toggle_strategies_store_1.default(db, eventBus, getLogger, config.flagResolver),
        clientFeatureToggleStore: new client_feature_toggle_store_1.default(db, eventBus, config),
        environmentStore: new environment_store_1.default(db, eventBus, config),
        featureTagStore: new feature_tag_store_1.default(db, eventBus, getLogger),
        featureEnvironmentStore: new feature_environment_store_1.FeatureEnvironmentStore(db, eventBus, config),
        userSplashStore: new user_splash_store_1.default(db, eventBus, getLogger),
        roleStore: new role_store_1.default(db, eventBus, getLogger),
        segmentStore: new segment_store_1.default(db, eventBus, getLogger, config.flagResolver),
        groupStore: new group_store_1.default(db),
        publicSignupTokenStore: new public_signup_token_store_1.PublicSignupTokenStore(db, eventBus, getLogger),
        patStore: new pat_store_1.default(db, getLogger),
        favoriteFeaturesStore: new favorite_features_store_1.FavoriteFeaturesStore(db, eventBus, getLogger),
        favoriteProjectsStore: new favorite_projects_store_1.FavoriteProjectsStore(db, eventBus, getLogger),
        projectStatsStore: new project_stats_store_1.default(db, eventBus, getLogger),
        importTogglesStore: new import_toggles_store_1.ImportTogglesStore(db),
        privateProjectStore: new privateProjectStore_1.default(db, getLogger),
        dependentFeaturesStore: new dependent_features_store_1.DependentFeaturesStore(db),
        lastSeenStore: new last_seen_store_1.default(db, eventBus, getLogger),
        featureSearchStore: new feature_search_store_1.default(db, eventBus, getLogger, config.flagResolver),
        inactiveUsersStore: new inactive_users_store_1.InactiveUsersStore(db, eventBus, getLogger),
        trafficDataUsageStore: new traffic_data_usage_store_1.TrafficDataUsageStore(db, getLogger),
        segmentReadModel: new segment_read_model_1.SegmentReadModel(db),
        projectOwnersReadModel: new project_owners_read_model_1.ProjectOwnersReadModel(db),
        projectFlagCreatorsReadModel: new project_flag_creators_read_model_1.ProjectFlagCreatorsReadModel(db),
        featureLifecycleStore: new feature_lifecycle_store_1.FeatureLifecycleStore(db),
        featureStrategiesReadModel: new feature_strategies_read_model_1.FeatureStrategiesReadModel(db),
        onboardingReadModel: (0, createOnboardingReadModel_1.createOnboardingReadModel)(db),
        onboardingStore: new onboarding_store_1.OnboardingStore(db),
        featureLifecycleReadModel: new feature_lifecycle_read_model_1.FeatureLifecycleReadModel(db, config.flagResolver),
        largestResourcesReadModel: new largest_resources_read_model_1.LargestResourcesReadModel(db),
        integrationEventsStore: new integration_events_store_1.IntegrationEventsStore(db, { eventBus }),
        featureCollaboratorsReadModel: new feature_collaborators_read_model_1.FeatureCollaboratorsReadModel(db),
        projectReadModel: (0, createProjectReadModel_1.createProjectReadModel)(db, eventBus, config.flagResolver),
        userUnsubscribeStore: new user_unsubscribe_store_1.UserUnsubscribeStore(db),
        userSubscriptionsReadModel: new user_subscriptions_read_model_1.UserSubscriptionsReadModel(db),
        uniqueConnectionStore: new unique_connection_store_1.UniqueConnectionStore(db),
        uniqueConnectionReadModel: new unique_connection_read_model_1.UniqueConnectionReadModel(new unique_connection_store_1.UniqueConnectionStore(db)),
    };
};
exports.createStores = createStores;
module.exports = {
    createStores: exports.createStores,
};
//# sourceMappingURL=index.js.map