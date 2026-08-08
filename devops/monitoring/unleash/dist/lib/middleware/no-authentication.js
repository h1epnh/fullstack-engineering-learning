"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.noApiToken = noApiToken;
const no_auth_user_1 = __importDefault(require("../types/no-auth-user"));
const api_token_1 = require("../types/models/api-token");
const server_impl_1 = require("../server-impl");
const util_1 = require("../util");
// eslint-disable-next-line
function noneAuthentication(baseUriPath, app) {
    app.use(`${baseUriPath || ''}/api/admin/`, (req, res, next) => {
        if (!req.user) {
            req.user = new no_auth_user_1.default();
        }
        next();
    });
}
function noApiToken(baseUriPath, app) {
    app.use(`${baseUriPath}/api/frontend`, (req, res, next) => {
        if (!req.headers.authorization && !req.user) {
            req.user = new server_impl_1.ApiUser({
                tokenName: 'unknown',
                permissions: [server_impl_1.permissions.FRONTEND],
                projects: ['*'],
                environment: util_1.DEFAULT_ENV,
                type: api_token_1.ApiTokenType.FRONTEND,
                secret: 'unknown',
            });
        }
        next();
    });
    app.use(`${baseUriPath}/api/client`, (req, res, next) => {
        if (!req.headers.authorization && !req.user) {
            req.user = new server_impl_1.ApiUser({
                tokenName: 'unknown',
                permissions: [server_impl_1.permissions.CLIENT],
                projects: ['*'],
                environment: util_1.DEFAULT_ENV,
                type: api_token_1.ApiTokenType.CLIENT,
                secret: 'unknown',
            });
        }
        next();
    });
}
exports.default = noneAuthentication;
//# sourceMappingURL=no-authentication.js.map