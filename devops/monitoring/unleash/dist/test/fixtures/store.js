"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fake_feature_strategies_store_1 = __importDefault(require("../../lib/features/feature-toggle/fakes/fake-feature-strategies-store"));
const fake_client_instance_store_1 = __importDefault(require("./fake-client-instance-store"));
const fake_client_applications_store_1 = __importDefault(require("./fake-client-applications-store"));
const fake_feature_toggle_store_1 = __importDefault(require("../../lib/features/feature-toggle/fakes/fake-feature-toggle-store"));
const fake_tag_store_1 = __importDefault(require("./fake-tag-store"));
const fake_tag_type_store_1 = __importDefault(require("../../lib/features/tag-type/fake-tag-type-store"));
const fake_event_store_1 = __importDefault(require("./fake-event-store"));
const fake_context_field_store_1 = __importDefault(require("../../lib/features/context/fake-context-field-store"));
const fake_setting_store_1 = __importDefault(require("./fake-setting-store"));
const fake_addon_store_1 = __importDefault(require("./fake-addon-store"));
const fake_project_store_1 = __importDefault(require("./fake-project-store"));
const fake_user_store_1 = __importDefault(require("./fake-user-store"));
const fake_access_store_1 = __importDefault(require("./fake-access-store"));
const fake_user_feedback_store_1 = __importDefault(require("./fake-user-feedback-store"));
const fake_feature_tag_store_1 = __importDefault(require("./fake-feature-tag-store"));
const fake_environment_store_1 = __importDefault(require("../../lib/features/project-environments/fake-environment-store"));
const fake_strategies_store_1 = __importDefault(require("./fake-strategies-store"));
const fake_session_store_1 = __importDefault(require("./fake-session-store"));
const fake_feature_environment_store_1 = __importDefault(require("./fake-feature-environment-store"));
const fake_api_token_store_1 = __importDefault(require("./fake-api-token-store"));
const fake_feature_type_store_1 = __importDefault(require("./fake-feature-type-store"));
const fake_reset_token_store_1 = __importDefault(require("./fake-reset-token-store"));
const fake_client_feature_toggle_store_1 = __importDefault(require("../../lib/features/client-feature-toggles/fakes/fake-client-feature-toggle-store"));
const fake_client_metrics_store_v2_1 = __importDefault(require("../../lib/features/metrics/client-metrics/fake-client-metrics-store-v2"));
const fake_user_splash_store_1 = __importDefault(require("./fake-user-splash-store"));
const fake_role_store_1 = __importDefault(require("./fake-role-store"));
const fake_segment_store_1 = __importDefault(require("./fake-segment-store"));
const fake_group_store_1 = __importDefault(require("./fake-group-store"));
const fake_pat_store_1 = __importDefault(require("./fake-pat-store"));
const fake_public_signup_store_1 = __importDefault(require("./fake-public-signup-store"));
const fake_favorite_features_store_1 = __importDefault(require("./fake-favorite-features-store"));
const fake_favorite_projects_store_1 = __importDefault(require("./fake-favorite-projects-store"));
const fake_account_store_1 = require("./fake-account-store");
const fake_project_stats_store_1 = __importDefault(require("./fake-project-stats-store"));
const fake_dependent_features_store_1 = require("../../lib/features/dependent-features/fake-dependent-features-store");
const fake_last_seen_store_1 = require("../../lib/features/metrics/last-seen/fake-last-seen-store");
const fake_feature_search_store_1 = __importDefault(require("../../lib/features/feature-search/fake-feature-search-store"));
const fake_inactive_users_store_1 = require("../../lib/users/inactive/fakes/fake-inactive-users-store");
const fake_traffic_data_usage_store_1 = require("../../lib/features/traffic-data-usage/fake-traffic-data-usage-store");
const fake_segment_read_model_1 = require("../../lib/features/segment/fake-segment-read-model");
const fake_project_owners_read_model_1 = require("../../lib/features/project/fake-project-owners-read-model");
const fake_feature_lifecycle_store_1 = require("../../lib/features/feature-lifecycle/fake-feature-lifecycle-store");
const fake_project_flag_creators_read_model_1 = require("../../lib/features/project/fake-project-flag-creators-read-model");
const fake_feature_strategies_read_model_1 = require("../../lib/features/feature-toggle/fake-feature-strategies-read-model");
const fake_feature_lifecycle_read_model_1 = require("../../lib/features/feature-lifecycle/fake-feature-lifecycle-read-model");
const fake_largest_resources_read_model_1 = require("../../lib/features/metrics/sizes/fake-largest-resources-read-model");
const fake_feature_collaborators_read_model_1 = require("../../lib/features/feature-toggle/fake-feature-collaborators-read-model");
const createProjectReadModel_1 = require("../../lib/features/project/createProjectReadModel");
const fake_onboarding_store_1 = require("../../lib/features/onboarding/fake-onboarding-store");
const createOnboardingReadModel_1 = require("../../lib/features/onboarding/createOnboardingReadModel");
const fake_user_unsubscribe_store_1 = require("../../lib/features/user-subscriptions/fake-user-unsubscribe-store");
const fake_user_subscriptions_read_model_1 = require("../../lib/features/user-subscriptions/fake-user-subscriptions-read-model");
const fake_unique_connection_store_1 = require("../../lib/features/unique-connection/fake-unique-connection-store");
const unique_connection_read_model_1 = require("../../lib/features/unique-connection/unique-connection-read-model");
const db = {
    select: () => ({
        from: () => Promise.resolve(),
    }),
};
const createStores = () => {
    const uniqueConnectionStore = new fake_unique_connection_store_1.FakeUniqueConnectionStore();
    return {
        db,
        clientApplicationsStore: new fake_client_applications_store_1.default(),
        clientMetricsStoreV2: new fake_client_metrics_store_v2_1.default(),
        clientInstanceStore: new fake_client_instance_store_1.default(),
        featureToggleStore: new fake_feature_toggle_store_1.default(),
        clientFeatureToggleStore: new fake_client_feature_toggle_store_1.default(),
        tagStore: new fake_tag_store_1.default(),
        tagTypeStore: new fake_tag_type_store_1.default(),
        eventStore: new fake_event_store_1.default(),
        strategyStore: new fake_strategies_store_1.default(),
        contextFieldStore: new fake_context_field_store_1.default(),
        settingStore: new fake_setting_store_1.default(),
        addonStore: new fake_addon_store_1.default(),
        projectStore: new fake_project_store_1.default(),
        userStore: new fake_user_store_1.default(),
        accessStore: new fake_access_store_1.default(),
        accountStore: new fake_account_store_1.FakeAccountStore(),
        userFeedbackStore: new fake_user_feedback_store_1.default(),
        featureStrategiesStore: new fake_feature_strategies_store_1.default(),
        featureTagStore: new fake_feature_tag_store_1.default(),
        environmentStore: new fake_environment_store_1.default(),
        featureEnvironmentStore: new fake_feature_environment_store_1.default(),
        apiTokenStore: new fake_api_token_store_1.default(),
        featureTypeStore: new fake_feature_type_store_1.default(),
        resetTokenStore: new fake_reset_token_store_1.default(),
        sessionStore: new fake_session_store_1.default(),
        userSplashStore: new fake_user_splash_store_1.default(),
        roleStore: new fake_role_store_1.default(),
        segmentStore: new fake_segment_store_1.default(),
        groupStore: new fake_group_store_1.default(),
        patStore: new fake_pat_store_1.default(),
        publicSignupTokenStore: new fake_public_signup_store_1.default(),
        favoriteFeaturesStore: new fake_favorite_features_store_1.default(),
        favoriteProjectsStore: new fake_favorite_projects_store_1.default(),
        projectStatsStore: new fake_project_stats_store_1.default(),
        importTogglesStore: {},
        privateProjectStore: {},
        dependentFeaturesStore: new fake_dependent_features_store_1.FakeDependentFeaturesStore(),
        lastSeenStore: new fake_last_seen_store_1.FakeLastSeenStore(),
        featureSearchStore: new fake_feature_search_store_1.default(),
        inactiveUsersStore: new fake_inactive_users_store_1.FakeInactiveUsersStore(),
        trafficDataUsageStore: new fake_traffic_data_usage_store_1.FakeTrafficDataUsageStore(),
        segmentReadModel: new fake_segment_read_model_1.FakeSegmentReadModel(),
        projectOwnersReadModel: new fake_project_owners_read_model_1.FakeProjectOwnersReadModel(),
        projectFlagCreatorsReadModel: new fake_project_flag_creators_read_model_1.FakeProjectFlagCreatorsReadModel(),
        featureLifecycleStore: new fake_feature_lifecycle_store_1.FakeFeatureLifecycleStore(),
        featureStrategiesReadModel: new fake_feature_strategies_read_model_1.FakeFeatureStrategiesReadModel(),
        featureLifecycleReadModel: new fake_feature_lifecycle_read_model_1.FakeFeatureLifecycleReadModel(),
        onboardingReadModel: (0, createOnboardingReadModel_1.createFakeOnboardingReadModel)(),
        largestResourcesReadModel: new fake_largest_resources_read_model_1.FakeLargestResourcesReadModel(),
        integrationEventsStore: {},
        featureCollaboratorsReadModel: new fake_feature_collaborators_read_model_1.FakeFeatureCollaboratorsReadModel(),
        projectReadModel: (0, createProjectReadModel_1.createFakeProjectReadModel)(),
        onboardingStore: new fake_onboarding_store_1.FakeOnboardingStore(),
        userUnsubscribeStore: new fake_user_unsubscribe_store_1.FakeUserUnsubscribeStore(),
        userSubscriptionsReadModel: new fake_user_subscriptions_read_model_1.FakeUserSubscriptionsReadModel(),
        uniqueConnectionStore,
        uniqueConnectionReadModel: new unique_connection_read_model_1.UniqueConnectionReadModel(uniqueConnectionStore),
    };
};
exports.default = createStores;
//# sourceMappingURL=store.js.map