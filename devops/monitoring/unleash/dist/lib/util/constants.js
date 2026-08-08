"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAT_LIMIT = exports.SEMVER_OPERATORS = exports.DATE_OPERATORS = exports.NUM_OPERATORS = exports.STRING_OPERATORS = exports.ALL_OPERATORS = exports.SEMVER_LT = exports.SEMVER_GT = exports.SEMVER_EQ = exports.DATE_BEFORE = exports.DATE_AFTER = exports.NUM_LTE = exports.NUM_LT = exports.NUM_GTE = exports.NUM_GT = exports.NUM_EQ = exports.STR_CONTAINS = exports.STR_STARTS_WITH = exports.STR_ENDS_WITH = exports.IN = exports.NOT_IN = exports.TAG_MAX_LENGTH = exports.TAG_MIN_LENGTH = exports.PROJECT_ROLE_TYPES = exports.ROOT_ROLE_TYPES = exports.PREDEFINED_ROLE_TYPES = exports.CUSTOM_PROJECT_ROLE_TYPE = exports.CUSTOM_ROOT_ROLE_TYPE = exports.PROJECT_ROLE_TYPE = exports.ROOT_ROLE_TYPE = exports.PROJECT_PERMISSION_TYPE = exports.ENVIRONMENT_PERMISSION_TYPE = exports.ROOT_PERMISSION_TYPE = exports.URL_SAFE_BASIC = exports.ALL_ENVS = exports.ALL_PROJECTS = exports.DEFAULT_ENV = void 0;
exports.DEFAULT_ENV = 'default';
exports.ALL_PROJECTS = '*';
exports.ALL_ENVS = '*';
exports.URL_SAFE_BASIC = /^[a-z0-9\-_]*$/;
exports.ROOT_PERMISSION_TYPE = 'root';
exports.ENVIRONMENT_PERMISSION_TYPE = 'environment';
exports.PROJECT_PERMISSION_TYPE = 'project';
exports.ROOT_ROLE_TYPE = 'root';
exports.PROJECT_ROLE_TYPE = 'project';
exports.CUSTOM_ROOT_ROLE_TYPE = 'root-custom';
exports.CUSTOM_PROJECT_ROLE_TYPE = 'custom';
exports.PREDEFINED_ROLE_TYPES = [exports.ROOT_ROLE_TYPE, exports.PROJECT_ROLE_TYPE];
exports.ROOT_ROLE_TYPES = [exports.ROOT_ROLE_TYPE, exports.CUSTOM_ROOT_ROLE_TYPE];
exports.PROJECT_ROLE_TYPES = [exports.PROJECT_ROLE_TYPE, exports.CUSTOM_PROJECT_ROLE_TYPE];
exports.TAG_MIN_LENGTH = 2;
exports.TAG_MAX_LENGTH = 50;
/* CONTEXT FIELD OPERATORS */
exports.NOT_IN = 'NOT_IN';
exports.IN = 'IN';
exports.STR_ENDS_WITH = 'STR_ENDS_WITH';
exports.STR_STARTS_WITH = 'STR_STARTS_WITH';
exports.STR_CONTAINS = 'STR_CONTAINS';
exports.NUM_EQ = 'NUM_EQ';
exports.NUM_GT = 'NUM_GT';
exports.NUM_GTE = 'NUM_GTE';
exports.NUM_LT = 'NUM_LT';
exports.NUM_LTE = 'NUM_LTE';
exports.DATE_AFTER = 'DATE_AFTER';
exports.DATE_BEFORE = 'DATE_BEFORE';
exports.SEMVER_EQ = 'SEMVER_EQ';
exports.SEMVER_GT = 'SEMVER_GT';
exports.SEMVER_LT = 'SEMVER_LT';
exports.ALL_OPERATORS = [
    exports.NOT_IN,
    exports.IN,
    exports.STR_ENDS_WITH,
    exports.STR_STARTS_WITH,
    exports.STR_CONTAINS,
    exports.NUM_EQ,
    exports.NUM_GT,
    exports.NUM_GTE,
    exports.NUM_LT,
    exports.NUM_LTE,
    exports.DATE_AFTER,
    exports.DATE_BEFORE,
    exports.SEMVER_EQ,
    exports.SEMVER_GT,
    exports.SEMVER_LT,
];
exports.STRING_OPERATORS = [
    exports.STR_ENDS_WITH,
    exports.STR_STARTS_WITH,
    exports.STR_CONTAINS,
    exports.IN,
    exports.NOT_IN,
];
exports.NUM_OPERATORS = [exports.NUM_EQ, exports.NUM_GT, exports.NUM_GTE, exports.NUM_LT, exports.NUM_LTE];
exports.DATE_OPERATORS = [exports.DATE_AFTER, exports.DATE_BEFORE];
exports.SEMVER_OPERATORS = [exports.SEMVER_EQ, exports.SEMVER_GT, exports.SEMVER_LT];
exports.PAT_LIMIT = 10;
//# sourceMappingURL=constants.js.map