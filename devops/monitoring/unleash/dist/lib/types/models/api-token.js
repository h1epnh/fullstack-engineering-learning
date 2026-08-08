"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateApiTokenEnvironment = exports.validateApiToken = exports.mapLegacyTokenWithSecret = exports.mapLegacyToken = exports.mapLegacyProjects = exports.isAllProjects = exports.ApiTokenType = exports.ALL = void 0;
const bad_data_error_1 = __importDefault(require("../../error/bad-data-error"));
exports.ALL = '*';
var ApiTokenType;
(function (ApiTokenType) {
    ApiTokenType["CLIENT"] = "client";
    ApiTokenType["ADMIN"] = "admin";
    ApiTokenType["FRONTEND"] = "frontend";
})(ApiTokenType || (exports.ApiTokenType = ApiTokenType = {}));
const isAllProjects = (projects) => {
    return projects && projects.length === 1 && projects[0] === exports.ALL;
};
exports.isAllProjects = isAllProjects;
const mapLegacyProjects = (project, projects) => {
    let cleanedProjects;
    if (project) {
        cleanedProjects = [project];
    }
    else if (projects) {
        cleanedProjects = projects;
        if (cleanedProjects.includes('*')) {
            cleanedProjects = ['*'];
        }
    }
    else {
        throw new bad_data_error_1.default('API tokens must either contain a project or projects field');
    }
    return cleanedProjects;
};
exports.mapLegacyProjects = mapLegacyProjects;
const mapLegacyToken = (token) => {
    const cleanedProjects = (0, exports.mapLegacyProjects)(token.project, token.projects);
    return {
        tokenName: token.username ?? token.tokenName,
        type: token.type,
        environment: token.environment || 'development',
        projects: cleanedProjects,
        expiresAt: token.expiresAt,
    };
};
exports.mapLegacyToken = mapLegacyToken;
const mapLegacyTokenWithSecret = (token) => {
    return {
        ...(0, exports.mapLegacyToken)(token),
        secret: token.secret,
    };
};
exports.mapLegacyTokenWithSecret = mapLegacyTokenWithSecret;
const validateApiToken = ({ type, projects, environment, }) => {
    if (type === ApiTokenType.ADMIN && !(0, exports.isAllProjects)(projects)) {
        throw new bad_data_error_1.default('Admin token cannot be scoped to single project');
    }
    if (type === ApiTokenType.ADMIN && environment !== exports.ALL) {
        throw new bad_data_error_1.default('Admin token cannot be scoped to single environment');
    }
    if (type === ApiTokenType.CLIENT && environment === exports.ALL) {
        throw new bad_data_error_1.default('Client token cannot be scoped to all environments');
    }
    if (type === ApiTokenType.FRONTEND && environment === exports.ALL) {
        throw new bad_data_error_1.default('Frontend token cannot be scoped to all environments');
    }
};
exports.validateApiToken = validateApiToken;
const validateApiTokenEnvironment = ({ environment }, environments) => {
    if (environment === exports.ALL) {
        return;
    }
    const selectedEnvironment = environments.find((env) => env.name === environment);
    if (!selectedEnvironment) {
        throw new bad_data_error_1.default(`Environment=${environment} does not exist`);
    }
};
exports.validateApiTokenEnvironment = validateApiTokenEnvironment;
//# sourceMappingURL=api-token.js.map