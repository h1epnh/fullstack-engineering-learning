"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authTypeFromString = authTypeFromString;
exports.resolveIsOss = resolveIsOss;
exports.createConfig = createConfig;
const pg_connection_string_1 = require("pg-connection-string");
const deepmerge_1 = __importDefault(require("deepmerge"));
const fs_1 = require("fs");
const option_1 = require("./types/option");
const logger_1 = require("./logger");
const default_custom_auth_deny_all_1 = require("./default-custom-auth-deny-all");
const format_base_uri_1 = require("./util/format-base-uri");
const date_fns_1 = require("date-fns");
const events_1 = __importDefault(require("events"));
const api_token_1 = require("./types/models/api-token");
const parseEnvVar_1 = require("./util/parseEnvVar");
const experimental_1 = require("./types/experimental");
const segments_1 = require("./util/segments");
const flag_resolver_1 = __importDefault(require("./util/flag-resolver"));
const validateOrigin_1 = require("./util/validateOrigin");
const safeToUpper = (s) => (s ? s.toUpperCase() : s);
function authTypeFromString(s, defaultType = option_1.IAuthType.OPEN_SOURCE) {
    const upperS = safeToUpper(s);
    return upperS && option_1.IAuthType[upperS] ? option_1.IAuthType[upperS] : defaultType;
}
function mergeAll(objects) {
    return deepmerge_1.default.all(objects.filter((i) => i));
}
function loadExperimental(options) {
    return {
        ...experimental_1.defaultExperimentalOptions,
        ...options.experimental,
        flags: {
            ...experimental_1.defaultExperimentalOptions.flags,
            ...options.experimental?.flags,
        },
    };
}
const defaultClientCachingOptions = {
    enabled: true,
    maxAge: (0, date_fns_1.hoursToMilliseconds)(1),
};
function loadClientCachingOptions(options) {
    const envs = {};
    if (process.env.CLIENT_FEATURE_CACHING_MAXAGE) {
        envs.maxAge = (0, parseEnvVar_1.parseEnvVarNumber)(process.env.CLIENT_FEATURE_CACHING_MAXAGE, 600);
    }
    if (process.env.CLIENT_FEATURE_CACHING_ENABLED) {
        envs.enabled = (0, parseEnvVar_1.parseEnvVarBoolean)(process.env.CLIENT_FEATURE_CACHING_ENABLED, true);
    }
    return mergeAll([
        defaultClientCachingOptions,
        options.clientFeatureCaching || {},
        envs,
    ]);
}
function loadMetricsRateLimitingConfig(options) {
    const clientMetricsMaxPerMinute = (0, parseEnvVar_1.parseEnvVarNumber)(process.env.REGISTER_CLIENT_RATE_LIMIT_PER_MINUTE, 6000);
    const clientRegisterMaxPerMinute = (0, parseEnvVar_1.parseEnvVarNumber)(process.env.CLIENT_METRICS_RATE_LIMIT_PER_MINUTE, 6000);
    const frontendRegisterMaxPerMinute = (0, parseEnvVar_1.parseEnvVarNumber)(process.env.REGISTER_FRONTEND_RATE_LIMIT_PER_MINUTE, 6000);
    const frontendMetricsMaxPerMinute = (0, parseEnvVar_1.parseEnvVarNumber)(process.env.FRONTEND_METRICS_RATE_LIMIT_PER_MINUTE, 6000);
    const defaultRateLimitOptions = {
        clientMetricsMaxPerMinute: clientMetricsMaxPerMinute,
        clientRegisterMaxPerMinute: clientRegisterMaxPerMinute,
        frontendRegisterMaxPerMinute: frontendRegisterMaxPerMinute,
        frontendMetricsMaxPerMinute: frontendMetricsMaxPerMinute,
    };
    return mergeAll([
        defaultRateLimitOptions,
        options.metricsRateLimiting ?? {},
    ]);
}
function loadRateLimitingConfig(options) {
    const createUserMaxPerMinute = (0, parseEnvVar_1.parseEnvVarNumber)(process.env.CREATE_USER_RATE_LIMIT_PER_MINUTE, 20);
    const simpleLoginMaxPerMinute = (0, parseEnvVar_1.parseEnvVarNumber)(process.env.SIMPLE_LOGIN_LIMIT_PER_MINUTE, 10);
    const passwordResetMaxPerMinute = (0, parseEnvVar_1.parseEnvVarNumber)(process.env.PASSWORD_RESET_LIMIT_PER_MINUTE, 1);
    const callSignalEndpointMaxPerSecond = (0, parseEnvVar_1.parseEnvVarNumber)(process.env.SIGNAL_ENDPOINT_RATE_LIMIT_PER_SECOND, 1);
    const defaultRateLimitOptions = {
        createUserMaxPerMinute,
        simpleLoginMaxPerMinute,
        passwordResetMaxPerMinute,
        callSignalEndpointMaxPerSecond,
    };
    return mergeAll([defaultRateLimitOptions, options.rateLimiting || {}]);
}
function loadUI(options) {
    const uiO = options.ui || {};
    const ui = {
        environment: 'Open Source',
    };
    return mergeAll([ui, uiO]);
}
const dateHandlingCallback = (connection, callback) => {
    connection.query("set datestyle to 'ISO, DMY';", (err) => {
        callback(err, connection);
    });
};
const readAndAddOption = (name, value, options) => value != null
    ? { ...options, [name]: (0, fs_1.readFileSync)(value).toString() }
    : options;
const databaseSSL = () => {
    if (process.env.DATABASE_SSL != null) {
        return JSON.parse(process.env.DATABASE_SSL);
    }
    if (process.env.DATABASE_SSL_CA_CONFIG != null) {
        return (0, fs_1.readFileSync)(process.env.DATABASE_SSL_CA_CONFIG).toString();
    }
    const rejectUnauthorizedDefault = process.env.DATABASE_SSL_CA_FILE != null ||
        process.env.DATABASE_SSL_CERT_FILE != null ||
        process.env.DATABASE_SSL_KEY_FILE != null;
    let options = {
        rejectUnauthorized: (0, parseEnvVar_1.parseEnvVarBoolean)(process.env.DATABASE_SSL_REJECT_UNAUTHORIZED, rejectUnauthorizedDefault),
    };
    options = readAndAddOption('key', process.env.DATABASE_SSL_KEY_FILE, options);
    options = readAndAddOption('cert', process.env.DATABASE_SSL_CERT_FILE, options);
    options = readAndAddOption('ca', process.env.DATABASE_SSL_CA_FILE, options);
    return options;
};
const defaultDbOptions = {
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_HOST,
    port: (0, parseEnvVar_1.parseEnvVarNumber)(process.env.DATABASE_PORT, 5432),
    database: process.env.DATABASE_NAME || 'unleash',
    ssl: databaseSSL(),
    driver: 'postgres',
    version: process.env.DATABASE_VERSION,
    acquireConnectionTimeout: (0, date_fns_1.secondsToMilliseconds)(30),
    pool: {
        min: (0, parseEnvVar_1.parseEnvVarNumber)(process.env.DATABASE_POOL_MIN, 0),
        max: (0, parseEnvVar_1.parseEnvVarNumber)(process.env.DATABASE_POOL_MAX, 4),
        idleTimeoutMillis: (0, parseEnvVar_1.parseEnvVarNumber)(process.env.DATABASE_POOL_IDLE_TIMEOUT_MS, (0, date_fns_1.secondsToMilliseconds)(30)),
        ...((0, parseEnvVar_1.parseEnvVarBoolean)(process.env.ALLOW_NON_STANDARD_DB_DATES, false)
            ? { afterCreate: dateHandlingCallback }
            : {}),
        propagateCreateError: false,
    },
    schema: process.env.DATABASE_SCHEMA || 'public',
    disableMigration: (0, parseEnvVar_1.parseEnvVarBoolean)(process.env.DATABASE_DISABLE_MIGRATION, false),
    applicationName: process.env.DATABASE_APPLICATION_NAME || 'unleash',
};
const defaultSessionOption = (isEnterprise) => ({
    ttlHours: (0, parseEnvVar_1.parseEnvVarNumber)(process.env.SESSION_TTL_HOURS, 48),
    clearSiteDataOnLogout: (0, parseEnvVar_1.parseEnvVarBoolean)(process.env.SESSION_CLEAR_SITE_DATA_ON_LOGOUT, true),
    cookieName: 'unleash-session',
    db: true,
    // default limit of 100 for enterprise, 5 for pro and oss
    // at least 1 session should be allowed
    maxParallelSessions: Math.max((0, parseEnvVar_1.parseEnvVarNumber)(process.env.MAX_PARALLEL_SESSIONS, isEnterprise ? 100 : 5), 1),
});
const defaultServerOption = {
    pipe: undefined,
    host: process.env.HTTP_HOST,
    port: (0, parseEnvVar_1.parseEnvVarNumber)(process.env.HTTP_PORT || process.env.PORT, 4242),
    baseUriPath: (0, format_base_uri_1.formatBaseUri)(process.env.BASE_URI_PATH),
    cdnPrefix: process.env.CDN_PREFIX,
    unleashUrl: process.env.UNLEASH_URL || 'http://localhost:4242',
    serverMetrics: true,
    enableHeapSnapshotEnpoint: (0, parseEnvVar_1.parseEnvVarBoolean)(process.env.ENABLE_HEAP_SNAPSHOT_ENPOINT, false),
    disableCompression: (0, parseEnvVar_1.parseEnvVarBoolean)(process.env.SERVER_DISABLE_COMPRESSION, false),
    keepAliveTimeout: (0, date_fns_1.secondsToMilliseconds)((0, parseEnvVar_1.parseEnvVarNumber)(process.env.SERVER_KEEPALIVE_TIMEOUT, 15)),
    headersTimeout: (0, date_fns_1.secondsToMilliseconds)(61),
    enableRequestLogger: (0, parseEnvVar_1.parseEnvVarBoolean)(process.env.REQUEST_LOGGER_ENABLE, false),
    gracefulShutdownEnable: (0, parseEnvVar_1.parseEnvVarBoolean)(process.env.GRACEFUL_SHUTDOWN_ENABLE, true),
    gracefulShutdownTimeout: (0, parseEnvVar_1.parseEnvVarNumber)(process.env.GRACEFUL_SHUTDOWN_TIMEOUT, (0, date_fns_1.secondsToMilliseconds)(1)),
    secret: process.env.UNLEASH_SECRET || 'super-secret',
    enableScheduledCreatedByMigration: (0, parseEnvVar_1.parseEnvVarBoolean)(process.env.ENABLE_SCHEDULED_CREATED_BY_MIGRATION, false),
};
const defaultVersionOption = {
    url: process.env.UNLEASH_VERSION_URL || 'https://version.unleash.run',
    enable: (0, parseEnvVar_1.parseEnvVarBoolean)(process.env.CHECK_VERSION, true),
};
const parseEnvVarInitialAdminUser = () => {
    const username = process.env.UNLEASH_DEFAULT_ADMIN_USERNAME;
    const password = process.env.UNLEASH_DEFAULT_ADMIN_PASSWORD;
    return username && password ? { username, password } : undefined;
};
const buildDefaultAuthOption = () => {
    return {
        demoAllowAdminLogin: (0, parseEnvVar_1.parseEnvVarBoolean)(process.env.AUTH_DEMO_ALLOW_ADMIN_LOGIN, false),
        enableApiToken: (0, parseEnvVar_1.parseEnvVarBoolean)(process.env.AUTH_ENABLE_API_TOKEN, true),
        type: authTypeFromString(process.env.AUTH_TYPE),
        customAuthHandler: default_custom_auth_deny_all_1.defaultCustomAuthDenyAll,
        createAdminUser: true,
        initialAdminUser: parseEnvVarInitialAdminUser(),
        initApiTokens: [],
    };
};
const defaultImport = {
    file: process.env.IMPORT_FILE,
    project: process.env.IMPORT_PROJECT ?? 'default',
    environment: process.env.IMPORT_ENVIRONMENT ?? 'development',
};
const defaultEmail = {
    host: process.env.EMAIL_HOST,
    secure: (0, parseEnvVar_1.parseEnvVarBoolean)(process.env.EMAIL_SECURE, false),
    port: (0, parseEnvVar_1.parseEnvVarNumber)(process.env.EMAIL_PORT, 587),
    sender: process.env.EMAIL_SENDER || 'Unleash <noreply@getunleash.io>',
    smtpuser: process.env.EMAIL_USER,
    smtppass: process.env.EMAIL_PASSWORD,
    optionalHeaders: (0, parseEnvVar_1.parseEnvVarJSON)(process.env.EMAIL_OPTIONAL_HEADERS, {}),
};
const dbPort = (dbConfig) => {
    if (typeof dbConfig.port === 'string') {
        dbConfig.port = Number.parseInt(dbConfig.port, 10);
    }
    return dbConfig;
};
const removeUndefinedKeys = (o) => Object.keys(o).reduce((a, key) => {
    if (o[key] !== undefined) {
        a[key] = o[key];
        return a;
    }
    return a;
}, {});
const formatServerOptions = (serverOptions) => {
    if (!serverOptions) {
        return {
            baseUriPath: (0, format_base_uri_1.formatBaseUri)(process.env.BASE_URI_PATH),
        };
    }
    return {
        ...serverOptions,
        baseUriPath: (0, format_base_uri_1.formatBaseUri)(process.env.BASE_URI_PATH || serverOptions.baseUriPath),
    };
};
const loadTokensFromString = (tokenString, tokenType) => {
    if (!tokenString) {
        return [];
    }
    const initApiTokens = tokenString.split(/,\s?/);
    const tokens = initApiTokens.map((secret) => {
        const [project = '*', rest] = secret.split(':');
        const [environment = '*'] = rest.split('.');
        const token = {
            createdAt: undefined,
            project,
            environment,
            secret,
            type: tokenType,
            tokenName: 'admin',
        };
        (0, api_token_1.validateApiToken)((0, api_token_1.mapLegacyToken)(token));
        return token;
    });
    return tokens;
};
const loadInitApiTokens = () => {
    return [
        ...loadTokensFromString(process.env.INIT_ADMIN_API_TOKENS, api_token_1.ApiTokenType.ADMIN),
        ...loadTokensFromString(process.env.INIT_CLIENT_API_TOKENS, api_token_1.ApiTokenType.CLIENT),
        ...loadTokensFromString(process.env.INIT_FRONTEND_API_TOKENS, api_token_1.ApiTokenType.FRONTEND),
    ];
};
const loadEnvironmentEnableOverrides = () => {
    const environmentsString = process.env.ENABLED_ENVIRONMENTS;
    if (environmentsString) {
        return environmentsString.split(',');
    }
    return [];
};
const parseCspConfig = (cspConfig) => {
    if (!cspConfig) {
        return undefined;
    }
    return {
        defaultSrc: cspConfig.defaultSrc || [],
        fontSrc: cspConfig.fontSrc || [],
        scriptSrc: cspConfig.scriptSrc || [],
        imgSrc: cspConfig.imgSrc || [],
        styleSrc: cspConfig.styleSrc || [],
        connectSrc: cspConfig.connectSrc || [],
        mediaSrc: cspConfig.mediaSrc || [],
        objectSrc: cspConfig.objectSrc || [],
        frameSrc: cspConfig.frameSrc || [],
    };
};
const parseCspEnvironmentVariables = () => {
    const defaultSrc = process.env.CSP_ALLOWED_DEFAULT?.split(',') || [];
    const fontSrc = process.env.CSP_ALLOWED_FONT?.split(',') || [];
    const styleSrc = process.env.CSP_ALLOWED_STYLE?.split(',') || [];
    const scriptSrc = process.env.CSP_ALLOWED_SCRIPT?.split(',') || [];
    const imgSrc = process.env.CSP_ALLOWED_IMG?.split(',') || [];
    const connectSrc = process.env.CSP_ALLOWED_CONNECT?.split(',') || [];
    const mediaSrc = process.env.CSP_ALLOWED_MEDIA?.split(',') || [];
    const objectSrc = process.env.CSP_ALLOWED_OBJECT?.split(',') || [];
    const frameSrc = process.env.CSP_ALLOWED_FRAME?.split(',') || [];
    return {
        defaultSrc,
        fontSrc,
        styleSrc,
        scriptSrc,
        imgSrc,
        connectSrc,
        mediaSrc,
        objectSrc,
        frameSrc,
    };
};
const parseFrontendApiOrigins = (options) => {
    const frontendApiOrigins = (0, parseEnvVar_1.parseEnvVarStrings)(process.env.UNLEASH_FRONTEND_API_ORIGINS, options.frontendApiOrigins || ['*']);
    const error = (0, validateOrigin_1.validateOrigins)(frontendApiOrigins);
    if (error) {
        throw new Error(error);
    }
    return frontendApiOrigins;
};
function resolveIsOss(isEnterprise, isOssOption, uiEnvironment, testEnvironmentActive = false) {
    return testEnvironmentActive
        ? (isOssOption ?? false)
        : !isEnterprise && uiEnvironment?.toLowerCase() !== 'pro';
}
function createConfig(options) {
    let extraDbOptions = {};
    if (options.databaseUrl) {
        extraDbOptions = (0, pg_connection_string_1.parse)(options.databaseUrl);
    }
    else if (process.env.DATABASE_URL) {
        extraDbOptions = (0, pg_connection_string_1.parse)(process.env.DATABASE_URL);
    }
    let fileDbOptions = {};
    if (options.databaseUrlFile && (0, fs_1.existsSync)(options.databaseUrlFile)) {
        fileDbOptions = (0, pg_connection_string_1.parse)((0, fs_1.readFileSync)(options.databaseUrlFile, 'utf-8'));
    }
    else if (process.env.DATABASE_URL_FILE &&
        (0, fs_1.existsSync)(process.env.DATABASE_URL_FILE)) {
        fileDbOptions = (0, pg_connection_string_1.parse)((0, fs_1.readFileSync)(process.env.DATABASE_URL_FILE, 'utf-8'));
    }
    const db = mergeAll([
        defaultDbOptions,
        dbPort(extraDbOptions),
        dbPort(fileDbOptions),
        options.db || {},
    ]);
    const logLevel = options.logLevel || logger_1.LogLevel[process.env.LOG_LEVEL ?? logger_1.LogLevel.error];
    const getLogger = options.getLogger || (0, logger_1.getDefaultLogProvider)(logLevel);
    (0, logger_1.validateLogProvider)(getLogger);
    const server = mergeAll([
        defaultServerOption,
        formatServerOptions(options.server) || {},
    ]);
    const versionCheck = mergeAll([
        defaultVersionOption,
        options.versionCheck || {},
    ]);
    const telemetry = options.telemetry ||
        (0, parseEnvVar_1.parseEnvVarBoolean)(process.env.SEND_TELEMETRY, true);
    const initApiTokens = loadInitApiTokens();
    const authentication = mergeAll([
        buildDefaultAuthOption(),
        (options.authentication
            ? removeUndefinedKeys(options.authentication)
            : options.authentication) || {},
        { initApiTokens: initApiTokens },
    ]);
    const environmentEnableOverrides = loadEnvironmentEnableOverrides();
    const importSetting = mergeAll([
        defaultImport,
        options.import || {},
    ]);
    const experimental = loadExperimental(options);
    const flagResolver = new flag_resolver_1.default(experimental);
    const ui = loadUI(options);
    const email = mergeAll([defaultEmail, options.email || {}]);
    let listen;
    if (server.pipe) {
        listen = { path: server.pipe };
    }
    else {
        listen = { host: server.host || undefined, port: server.port ?? 4242 };
    }
    const frontendApi = options.frontendApi || {
        refreshIntervalInMs: (0, parseEnvVar_1.parseEnvVarNumber)(process.env.FRONTEND_API_REFRESH_INTERVAL_MS, (0, date_fns_1.minutesToMilliseconds)(45)),
    };
    const secureHeaders = options.secureHeaders ||
        (0, parseEnvVar_1.parseEnvVarBoolean)(process.env.SECURE_HEADERS, false);
    const enableOAS = (0, parseEnvVar_1.parseEnvVarBoolean)(process.env.ENABLE_OAS, true);
    const additionalCspAllowedDomains = parseCspConfig(options.additionalCspAllowedDomains) ||
        parseCspEnvironmentVariables();
    const inlineSegmentConstraints = typeof options.inlineSegmentConstraints === 'boolean'
        ? options.inlineSegmentConstraints
        : true;
    const segmentValuesLimit = (0, parseEnvVar_1.parseEnvVarNumber)(process.env.UNLEASH_SEGMENT_VALUES_LIMIT, segments_1.DEFAULT_SEGMENT_VALUES_LIMIT);
    const strategySegmentsLimit = (0, parseEnvVar_1.parseEnvVarNumber)(process.env.UNLEASH_STRATEGY_SEGMENTS_LIMIT, segments_1.DEFAULT_STRATEGY_SEGMENTS_LIMIT);
    const accessControlMaxAge = options.accessControlMaxAge
        ? options.accessControlMaxAge
        : (0, parseEnvVar_1.parseEnvVarNumber)(process.env.ACCESS_CONTROL_MAX_AGE, 86400);
    const clientFeatureCaching = loadClientCachingOptions(options);
    const prometheusApi = options.prometheusApi || process.env.PROMETHEUS_API;
    const isEnterprise = Boolean(options.enterpriseVersion) &&
        ui.environment?.toLowerCase() !== 'pro';
    const isTest = process.env.NODE_ENV === 'test';
    const isOss = resolveIsOss(isEnterprise, options.isOss, ui.environment, isTest);
    const session = mergeAll([
        defaultSessionOption(isEnterprise),
        options.session || {},
    ]);
    const metricsRateLimiting = loadMetricsRateLimitingConfig(options);
    const rateLimiting = loadRateLimitingConfig(options);
    const feedbackUriPath = process.env.FEEDBACK_URI_PATH;
    const dailyMetricsStorageDays = Math.min((0, parseEnvVar_1.parseEnvVarNumber)(process.env.DAILY_METRICS_STORAGE_DAYS, 91), 91);
    const resourceLimits = {
        segmentValues: segmentValuesLimit,
        strategySegments: strategySegmentsLimit,
        signalEndpoints: (0, parseEnvVar_1.parseEnvVarNumber)(process.env.UNLEASH_SIGNAL_ENDPOINTS_LIMIT, 5),
        actionSetActions: (0, parseEnvVar_1.parseEnvVarNumber)(process.env.UNLEASH_ACTION_SET_ACTIONS_LIMIT, 10),
        actionSetsPerProject: (0, parseEnvVar_1.parseEnvVarNumber)(process.env.UNLEASH_ACTION_SETS_PER_PROJECT_LIMIT, 5),
        actionSetFilters: (0, parseEnvVar_1.parseEnvVarNumber)(process.env.UNLEASH_ACTION_SET_FILTERS_LIMIT, 5),
        actionSetFilterValues: (0, parseEnvVar_1.parseEnvVarNumber)(process.env.UNLEASH_ACTION_SET_FILTER_VALUES_LIMIT, 25),
        signalTokensPerEndpoint: (0, parseEnvVar_1.parseEnvVarNumber)(process.env.UNLEASH_SIGNAL_TOKENS_PER_ENDPOINT_LIMIT, 5),
        featureEnvironmentStrategies: Math.max(1, (0, parseEnvVar_1.parseEnvVarNumber)(process.env.UNLEASH_FEATURE_ENVIRONMENT_STRATEGIES_LIMIT, options?.resourceLimits?.featureEnvironmentStrategies ?? 30)),
        constraintValues: Math.max(1, (0, parseEnvVar_1.parseEnvVarNumber)(process.env.UNLEASH_CONSTRAINT_VALUES_LIMIT, options?.resourceLimits?.constraintValues ?? 250)),
        constraints: Math.max(0, (0, parseEnvVar_1.parseEnvVarNumber)(process.env.UNLEASH_CONSTRAINTS_LIMIT, options?.resourceLimits?.constraints ?? 30)),
        environments: Math.max(1, (0, parseEnvVar_1.parseEnvVarNumber)(process.env.UNLEASH_ENVIRONMENTS_LIMIT, options?.resourceLimits?.environments ?? 50)),
        projects: Math.max(1, (0, parseEnvVar_1.parseEnvVarNumber)(process.env.UNLEASH_PROJECTS_LIMIT, options?.resourceLimits?.projects ?? 500)),
        apiTokens: Math.max(0, (0, parseEnvVar_1.parseEnvVarNumber)(process.env.UNLEASH_API_TOKENS_LIMIT, options?.resourceLimits?.apiTokens ?? 2000)),
        segments: Math.max(0, (0, parseEnvVar_1.parseEnvVarNumber)(process.env.UNLEASH_SEGMENTS_LIMIT, options?.resourceLimits?.segments ?? 300)),
        featureFlags: Math.max(1, (0, parseEnvVar_1.parseEnvVarNumber)(process.env.UNLEASH_FEATURE_FLAGS_LIMIT, options?.resourceLimits?.featureFlags ?? 5000)),
    };
    const openAIAPIKey = process.env.OPENAI_API_KEY;
    const defaultDaysToBeConsideredInactive = 180;
    const userInactivityThresholdInDays = options.userInactivityThresholdInDays ??
        (0, parseEnvVar_1.parseEnvVarNumber)(process.env.USER_INACTIVITY_THRESHOLD_IN_DAYS, defaultDaysToBeConsideredInactive);
    return {
        db,
        session,
        getLogger,
        server,
        listen,
        versionCheck,
        telemetry,
        authentication,
        ui,
        import: importSetting,
        experimental,
        flagResolver,
        frontendApi,
        email,
        secureHeaders,
        enableOAS,
        preHook: options.preHook,
        preRouterHook: options.preRouterHook,
        enterpriseVersion: options.enterpriseVersion,
        eventBus: new events_1.default(),
        environmentEnableOverrides,
        additionalCspAllowedDomains,
        frontendApiOrigins: parseFrontendApiOrigins(options),
        inlineSegmentConstraints,
        segmentValuesLimit,
        strategySegmentsLimit,
        resourceLimits,
        clientFeatureCaching,
        accessControlMaxAge,
        prometheusApi,
        publicFolder: options.publicFolder,
        disableScheduler: options.disableScheduler,
        isEnterprise: isEnterprise,
        isOss: isOss,
        metricsRateLimiting,
        rateLimiting,
        feedbackUriPath,
        dailyMetricsStorageDays,
        openAIAPIKey,
        userInactivityThresholdInDays,
        buildDate: process.env.BUILD_DATE,
    };
}
module.exports = {
    createConfig,
    resolveIsOss,
    authTypeFromString,
};
//# sourceMappingURL=create-config.js.map