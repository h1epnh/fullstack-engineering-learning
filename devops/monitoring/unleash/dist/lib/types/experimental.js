"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultExperimentalOptions = void 0;
const unleash_client_1 = require("unleash-client");
const util_1 = require("../util");
const variant_1 = require("unleash-client/lib/variant");
const flags = {
    anonymiseEventLog: false,
    enableLicense: false,
    enableLicenseChecker: false,
    embedProxy: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_EMBED_PROXY, true),
    embedProxyFrontend: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_EMBED_PROXY_FRONTEND, true),
    responseTimeWithAppNameKillSwitch: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_RESPONSE_TIME_WITH_APP_NAME_KILL_SWITCH, false),
    maintenanceMode: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_MAINTENANCE_MODE, false),
    messageBanner: {
        name: 'message-banner',
        enabled: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_MESSAGE_BANNER, false),
        payload: {
            type: unleash_client_1.PayloadType.JSON,
            value: process.env.UNLEASH_EXPERIMENTAL_MESSAGE_BANNER_PAYLOAD ?? '',
        },
    },
    caseInsensitiveInOperators: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_CASE_INSENSITIVE_IN_OPERATORS, false),
    strictSchemaValidation: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_STRICT_SCHEMA_VALIDTION, false),
    personalAccessTokensKillSwitch: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_PAT_KILL_SWITCH, false),
    migrationLock: (0, util_1.parseEnvVarBoolean)(process.env.MIGRATION_LOCK, true),
    demo: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_DEMO, false),
    googleAuthEnabled: (0, util_1.parseEnvVarBoolean)(process.env.GOOGLE_AUTH_ENABLED, false),
    disableBulkToggle: (0, util_1.parseEnvVarBoolean)(process.env.DISABLE_BULK_TOGGLE, false),
    disableNotifications: (0, util_1.parseEnvVarBoolean)(process.env.DISABLE_NOTIFICATIONS, false),
    filterInvalidClientMetrics: (0, util_1.parseEnvVarBoolean)(process.env.FILTER_INVALID_CLIENT_METRICS, false),
    filterExistingFlagNames: (0, util_1.parseEnvVarBoolean)(process.env.FILTER_INVALID_CLIENT_METRICS, false),
    disableMetrics: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_DISABLE_METRICS, false),
    signals: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_SIGNALS, false),
    automatedActions: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_AUTOMATED_ACTIONS, false),
    celebrateUnleash: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_CELEBRATE_UNLEASH, false),
    feedbackPosting: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_FEEDBACK_POSTING, false),
    encryptEmails: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_ENCRYPT_EMAILS, false),
    extendedUsageMetrics: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_EXTENDED_USAGE_METRICS, false),
    outdatedSdksBanner: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_OUTDATED_SDKS_BANNER, false),
    feedbackComments: {
        name: 'feedbackComments',
        enabled: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_FEEDBACK_COMMENTS, false),
        payload: {
            type: unleash_client_1.PayloadType.JSON,
            value: process.env.UNLEASH_EXPERIMENTAL_FEEDBACK_COMMENTS_PAYLOAD ??
                '',
        },
    },
    showInactiveUsers: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_SHOW_INACTIVE_USERS, false),
    useMemoizedActiveTokens: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_MEMOIZED_ACTIVE_TOKENS, false),
    killScheduledChangeRequestCache: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_KILL_SCHEDULED_CHANGE_REQUEST_CACHE, false),
    estimateTrafficDataCost: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_ESTIMATE_TRAFFIC_DATA_COST, false),
    userAccessUIEnabled: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_USER_ACCESS_UI_ENABLED, false),
    disableUpdateMaxRevisionId: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_DISABLE_SCHEDULED_CACHES, false),
    disablePublishUnannouncedEvents: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_DISABLE_SCHEDULED_CACHES, false),
    queryMissingTokens: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_QUERY_MISSING_TOKENS, false),
    responseTimeMetricsFix: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_RESPONSE_TIME_METRICS_FIX, false),
    disableShowContextFieldSelectionValues: (0, util_1.parseEnvVarBoolean)(process.env
        .UNLEASH_EXPERIMENTAL_DISABLE_SHOW_CONTEXT_FIELD_SELECTION_VALUES, false),
    manyStrategiesPagination: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_MANY_STRATEGIES_PAGINATION, false),
    enableLegacyVariants: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_ENABLE_LEGACY_VARIANTS, false),
    extendedMetrics: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_EXTENDED_METRICS, false),
    removeUnsafeInlineStyleSrc: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_REMOVE_UNSAFE_INLINE_STYLE_SRC, false),
    projectRoleAssignment: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_PROJECT_ROLE_ASSIGNMENT, false),
    originMiddlewareRequestLogging: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_ORIGIN_MIDDLEWARE_REQUEST_LOGGING, false),
    webhookDomainLogging: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENT_WEBHOOK_DOMAIN_LOGGING, false),
    releasePlans: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_RELEASE_PLANS, false),
    productivityReportEmail: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_PRODUCTIVITY_REPORT_EMAIL, false),
    productivityReportUnsubscribers: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_PRODUCTIVITY_REPORT_UNSUBSCRIBERS, false),
    'enterprise-payg': (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_ENTERPRISE_PAYG, false),
    showUserDeviceCount: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_SHOW_USER_DEVICE_COUNT, false),
    flagOverviewRedesign: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_FLAG_OVERVIEW_REDESIGN, false),
    streaming: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_STREAMING, false),
    etagVariant: {
        name: 'disabled',
        feature_enabled: false,
        enabled: false,
    },
    deltaApi: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_DELTA_API, false),
    uniqueSdkTracking: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_UNIQUE_SDK_TRACKING, false),
    consumptionModel: (0, util_1.parseEnvVarBoolean)(process.env.EXPERIMENTAL_CONSUMPTION_MODEL, false),
    teamsIntegrationChangeRequests: (0, util_1.parseEnvVarBoolean)(process.env.EXPERIMENTAL_TEAMS_INTEGRATION_CHANGE_REQUESTS, false),
    edgeObservability: (0, util_1.parseEnvVarBoolean)(process.env.EXPERIMENTAL_EDGE_OBSERVABILITY, false),
    simplifyDisableFeature: (0, util_1.parseEnvVarBoolean)(process.env.EXPERIMENTAL_SIMPLIFY_DISABLE_FEATURE, false),
    adminNavUI: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_ADMIN_NAV_UI, false),
    tagTypeColor: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_TAG_TYPE_COLOR, false),
    globalChangeRequestConfig: (0, util_1.parseEnvVarBoolean)(process.env.UNLEASH_EXPERIMENTAL_GLOBAL_CHANGE_REQUEST_CONFIG, false),
};
exports.defaultExperimentalOptions = {
    flags,
    externalResolver: {
        isEnabled: () => false,
        getVariant: () => (0, variant_1.getDefaultVariant)(),
    },
};
//# sourceMappingURL=experimental.js.map