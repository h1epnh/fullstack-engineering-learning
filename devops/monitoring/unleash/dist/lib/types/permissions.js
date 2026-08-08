"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE_FEATURE_STRATEGY = exports.UPDATE_FEATURE_STRATEGY = exports.CREATE_FEATURE_STRATEGY = exports.UPDATE_PROJECT_SEGMENT = exports.DELETE_PROJECT_API_TOKEN = exports.CREATE_PROJECT_API_TOKEN = exports.READ_PROJECT_API_TOKEN = exports.MOVE_FEATURE_TOGGLE = exports.UPDATE_FEATURE_VARIANTS = exports.DELETE_PROJECT = exports.UPDATE_PROJECT = exports.DELETE_FEATURE = exports.UPDATE_FEATURE_DEPENDENCY = exports.UPDATE_FEATURE = exports.CREATE_FEATURE = exports.UPDATE_AUTH_CONFIGURATION = exports.UPDATE_CORS = exports.UPDATE_INSTANCE_BANNERS = exports.UPDATE_MAINTENANCE_MODE = exports.READ_LOGS = exports.DELETE_TAG_TYPE = exports.UPDATE_TAG_TYPE = exports.CREATE_TAG_TYPE = exports.DELETE_STRATEGY = exports.UPDATE_STRATEGY = exports.CREATE_STRATEGY = exports.DELETE_SEGMENT = exports.UPDATE_SEGMENT = exports.CREATE_SEGMENT = exports.READ_ROLE = exports.CREATE_PROJECT = exports.DELETE_CONTEXT_FIELD = exports.UPDATE_CONTEXT_FIELD = exports.CREATE_CONTEXT_FIELD = exports.UPDATE_APPLICATION = exports.READ_FRONTEND_API_TOKEN = exports.DELETE_FRONTEND_API_TOKEN = exports.CREATE_FRONTEND_API_TOKEN = exports.UPDATE_FRONTEND_API_TOKEN = exports.READ_CLIENT_API_TOKEN = exports.DELETE_CLIENT_API_TOKEN = exports.CREATE_CLIENT_API_TOKEN = exports.UPDATE_CLIENT_API_TOKEN = exports.DELETE_ADDON = exports.UPDATE_ADDON = exports.CREATE_ADDON = exports.NONE = exports.FRONTEND = exports.CLIENT = exports.ADMIN = void 0;
exports.PROJECT_PERMISSIONS_STRUCTURE = exports.MAINTENANCE_MODE_PERMISSIONS = exports.ROOT_PERMISSION_CATEGORIES = exports.RELEASE_PLAN_TEMPLATE_DELETE = exports.RELEASE_PLAN_TEMPLATE_UPDATE = exports.RELEASE_PLAN_TEMPLATE_CREATE = exports.PROJECT_SETTINGS_WRITE = exports.PROJECT_CHANGE_REQUEST_WRITE = exports.PROJECT_DEFAULT_STRATEGY_WRITE = exports.PROJECT_USER_ACCESS_WRITE = exports.PROJECT_SETTINGS_READ = exports.PROJECT_CHANGE_REQUEST_READ = exports.PROJECT_DEFAULT_STRATEGY_READ = exports.PROJECT_USER_ACCESS_READ = exports.SKIP_CHANGE_REQUEST = exports.APPLY_CHANGE_REQUEST = exports.APPROVE_CHANGE_REQUEST = exports.UPDATE_FEATURE_ENVIRONMENT = exports.UPDATE_FEATURE_ENVIRONMENT_VARIANTS = void 0;
// Special
exports.ADMIN = 'ADMIN';
exports.CLIENT = 'CLIENT';
exports.FRONTEND = 'FRONTEND';
exports.NONE = 'NONE';
// Root
exports.CREATE_ADDON = 'CREATE_ADDON';
exports.UPDATE_ADDON = 'UPDATE_ADDON';
exports.DELETE_ADDON = 'DELETE_ADDON';
exports.UPDATE_CLIENT_API_TOKEN = 'UPDATE_CLIENT_API_TOKEN';
exports.CREATE_CLIENT_API_TOKEN = 'CREATE_CLIENT_API_TOKEN';
exports.DELETE_CLIENT_API_TOKEN = 'DELETE_CLIENT_API_TOKEN';
exports.READ_CLIENT_API_TOKEN = 'READ_CLIENT_API_TOKEN';
exports.UPDATE_FRONTEND_API_TOKEN = 'UPDATE_FRONTEND_API_TOKEN';
exports.CREATE_FRONTEND_API_TOKEN = 'CREATE_FRONTEND_API_TOKEN';
exports.DELETE_FRONTEND_API_TOKEN = 'DELETE_FRONTEND_API_TOKEN';
exports.READ_FRONTEND_API_TOKEN = 'READ_FRONTEND_API_TOKEN';
exports.UPDATE_APPLICATION = 'UPDATE_APPLICATION';
exports.CREATE_CONTEXT_FIELD = 'CREATE_CONTEXT_FIELD';
exports.UPDATE_CONTEXT_FIELD = 'UPDATE_CONTEXT_FIELD';
exports.DELETE_CONTEXT_FIELD = 'DELETE_CONTEXT_FIELD';
exports.CREATE_PROJECT = 'CREATE_PROJECT';
exports.READ_ROLE = 'READ_ROLE';
exports.CREATE_SEGMENT = 'CREATE_SEGMENT';
exports.UPDATE_SEGMENT = 'UPDATE_SEGMENT';
exports.DELETE_SEGMENT = 'DELETE_SEGMENT';
exports.CREATE_STRATEGY = 'CREATE_STRATEGY';
exports.UPDATE_STRATEGY = 'UPDATE_STRATEGY';
exports.DELETE_STRATEGY = 'DELETE_STRATEGY';
exports.CREATE_TAG_TYPE = 'CREATE_TAG_TYPE';
exports.UPDATE_TAG_TYPE = 'UPDATE_TAG_TYPE';
exports.DELETE_TAG_TYPE = 'DELETE_TAG_TYPE';
exports.READ_LOGS = 'READ_LOGS';
exports.UPDATE_MAINTENANCE_MODE = 'UPDATE_MAINTENANCE_MODE';
exports.UPDATE_INSTANCE_BANNERS = 'UPDATE_INSTANCE_BANNERS';
exports.UPDATE_CORS = 'UPDATE_CORS';
exports.UPDATE_AUTH_CONFIGURATION = 'UPDATE_AUTH_CONFIGURATION';
// Project
exports.CREATE_FEATURE = 'CREATE_FEATURE';
exports.UPDATE_FEATURE = 'UPDATE_FEATURE';
exports.UPDATE_FEATURE_DEPENDENCY = 'UPDATE_FEATURE_DEPENDENCY';
exports.DELETE_FEATURE = 'DELETE_FEATURE';
exports.UPDATE_PROJECT = 'UPDATE_PROJECT';
exports.DELETE_PROJECT = 'DELETE_PROJECT';
exports.UPDATE_FEATURE_VARIANTS = 'UPDATE_FEATURE_VARIANTS';
exports.MOVE_FEATURE_TOGGLE = 'MOVE_FEATURE_TOGGLE';
exports.READ_PROJECT_API_TOKEN = 'READ_PROJECT_API_TOKEN';
exports.CREATE_PROJECT_API_TOKEN = 'CREATE_PROJECT_API_TOKEN';
exports.DELETE_PROJECT_API_TOKEN = 'DELETE_PROJECT_API_TOKEN';
exports.UPDATE_PROJECT_SEGMENT = 'UPDATE_PROJECT_SEGMENT';
exports.CREATE_FEATURE_STRATEGY = 'CREATE_FEATURE_STRATEGY';
exports.UPDATE_FEATURE_STRATEGY = 'UPDATE_FEATURE_STRATEGY';
exports.DELETE_FEATURE_STRATEGY = 'DELETE_FEATURE_STRATEGY';
exports.UPDATE_FEATURE_ENVIRONMENT_VARIANTS = 'UPDATE_FEATURE_ENVIRONMENT_VARIANTS';
exports.UPDATE_FEATURE_ENVIRONMENT = 'UPDATE_FEATURE_ENVIRONMENT';
exports.APPROVE_CHANGE_REQUEST = 'APPROVE_CHANGE_REQUEST';
exports.APPLY_CHANGE_REQUEST = 'APPLY_CHANGE_REQUEST';
exports.SKIP_CHANGE_REQUEST = 'SKIP_CHANGE_REQUEST';
exports.PROJECT_USER_ACCESS_READ = 'PROJECT_USER_ACCESS_READ';
exports.PROJECT_DEFAULT_STRATEGY_READ = 'PROJECT_DEFAULT_STRATEGY_READ';
exports.PROJECT_CHANGE_REQUEST_READ = 'PROJECT_CHANGE_REQUEST_READ';
exports.PROJECT_SETTINGS_READ = 'PROJECT_SETTINGS_READ';
exports.PROJECT_USER_ACCESS_WRITE = 'PROJECT_USER_ACCESS_WRITE';
exports.PROJECT_DEFAULT_STRATEGY_WRITE = 'PROJECT_DEFAULT_STRATEGY_WRITE';
exports.PROJECT_CHANGE_REQUEST_WRITE = 'PROJECT_CHANGE_REQUEST_WRITE';
exports.PROJECT_SETTINGS_WRITE = 'PROJECT_SETTINGS_WRITE';
exports.RELEASE_PLAN_TEMPLATE_CREATE = 'RELEASE_PLAN_TEMPLATE_CREATE';
exports.RELEASE_PLAN_TEMPLATE_UPDATE = 'RELEASE_PLAN_TEMPLATE_UPDATE';
exports.RELEASE_PLAN_TEMPLATE_DELETE = 'RELEASE_PLAN_TEMPLATE_DELETE';
exports.ROOT_PERMISSION_CATEGORIES = [
    {
        label: 'Integration',
        permissions: [exports.CREATE_ADDON, exports.UPDATE_ADDON, exports.DELETE_ADDON],
    },
    {
        label: 'API token',
        permissions: [
            exports.UPDATE_CLIENT_API_TOKEN,
            exports.CREATE_CLIENT_API_TOKEN,
            exports.DELETE_CLIENT_API_TOKEN,
            exports.READ_CLIENT_API_TOKEN,
            exports.UPDATE_FRONTEND_API_TOKEN,
            exports.CREATE_FRONTEND_API_TOKEN,
            exports.DELETE_FRONTEND_API_TOKEN,
            exports.READ_FRONTEND_API_TOKEN,
        ],
    },
    {
        label: 'Application',
        permissions: [exports.UPDATE_APPLICATION],
    },
    {
        label: 'Context field',
        permissions: [
            exports.CREATE_CONTEXT_FIELD,
            exports.UPDATE_CONTEXT_FIELD,
            exports.DELETE_CONTEXT_FIELD,
        ],
    },
    {
        label: 'Project',
        permissions: [exports.CREATE_PROJECT],
    },
    {
        label: 'Role',
        permissions: [exports.READ_ROLE],
    },
    {
        label: 'Segment',
        permissions: [exports.CREATE_SEGMENT, exports.UPDATE_SEGMENT, exports.DELETE_SEGMENT],
    },
    {
        label: 'Strategy',
        permissions: [exports.CREATE_STRATEGY, exports.UPDATE_STRATEGY, exports.DELETE_STRATEGY],
    },
    {
        label: 'Tag type',
        permissions: [exports.CREATE_TAG_TYPE, exports.UPDATE_TAG_TYPE, exports.DELETE_TAG_TYPE],
    },
    {
        label: 'Release plan templates',
        permissions: [
            exports.RELEASE_PLAN_TEMPLATE_CREATE,
            exports.RELEASE_PLAN_TEMPLATE_DELETE,
            exports.RELEASE_PLAN_TEMPLATE_UPDATE,
        ],
    },
    {
        label: 'Instance maintenance',
        permissions: [
            exports.READ_LOGS,
            exports.UPDATE_MAINTENANCE_MODE,
            exports.UPDATE_INSTANCE_BANNERS,
            exports.UPDATE_CORS,
        ],
    },
    {
        label: 'Authentication',
        permissions: [exports.UPDATE_AUTH_CONFIGURATION],
    },
];
// Used on Frontend, to allow admin panel use for users with custom root roles
exports.MAINTENANCE_MODE_PERMISSIONS = [
    exports.ADMIN,
    exports.READ_ROLE,
    exports.READ_CLIENT_API_TOKEN,
    exports.READ_FRONTEND_API_TOKEN,
    exports.UPDATE_MAINTENANCE_MODE,
    exports.READ_LOGS,
];
exports.PROJECT_PERMISSIONS_STRUCTURE = [
    {
        label: 'Features and strategies',
        permissions: [
            [exports.CREATE_FEATURE],
            [exports.UPDATE_FEATURE],
            [exports.UPDATE_FEATURE_DEPENDENCY],
            [exports.DELETE_FEATURE],
            [exports.UPDATE_FEATURE_VARIANTS],
            [exports.MOVE_FEATURE_TOGGLE],
            [exports.CREATE_FEATURE_STRATEGY],
            [exports.UPDATE_FEATURE_STRATEGY],
            [exports.DELETE_FEATURE_STRATEGY],
            [exports.UPDATE_FEATURE_ENVIRONMENT],
            [exports.UPDATE_FEATURE_ENVIRONMENT_VARIANTS],
            [exports.UPDATE_PROJECT_SEGMENT],
        ],
    },
    {
        label: 'Project settings',
        permissions: [
            [exports.UPDATE_PROJECT],
            [exports.PROJECT_USER_ACCESS_READ, exports.UPDATE_PROJECT],
            [exports.PROJECT_USER_ACCESS_WRITE, exports.UPDATE_PROJECT],
            [exports.PROJECT_DEFAULT_STRATEGY_READ, exports.UPDATE_PROJECT],
            [exports.PROJECT_DEFAULT_STRATEGY_WRITE, exports.UPDATE_PROJECT],
            [exports.PROJECT_SETTINGS_READ, exports.UPDATE_PROJECT],
            [exports.PROJECT_SETTINGS_WRITE, exports.UPDATE_PROJECT],
            [exports.DELETE_PROJECT],
        ],
    },
    {
        label: 'API tokens',
        permissions: [
            [exports.READ_PROJECT_API_TOKEN],
            [exports.CREATE_PROJECT_API_TOKEN],
            [exports.DELETE_PROJECT_API_TOKEN],
        ],
    },
    {
        label: 'Change requests',
        permissions: [
            [exports.PROJECT_CHANGE_REQUEST_WRITE, exports.UPDATE_PROJECT],
            [exports.PROJECT_CHANGE_REQUEST_READ, exports.UPDATE_PROJECT],
        ],
    },
];
//# sourceMappingURL=permissions.js.map