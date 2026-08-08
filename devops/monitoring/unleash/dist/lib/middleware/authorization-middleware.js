"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_impl_1 = require("../server-impl");
const unauthorized_error_1 = __importDefault(require("../error/unauthorized-error"));
const authorizationMiddleware = (getLogger, baseUriPath) => {
    const logger = getLogger('/middleware/authorization-middleware.ts');
    logger.debug('Enabling Authorization middleware');
    return async (req, res, next) => {
        if (!req.user?.isAPI && req.session?.user) {
            req.user = req.session.user;
            return next();
        }
        if (req.user) {
            return next();
        }
        if (req.header('authorization')) {
            // API clients should get 401 with a basic body
            const error = new unauthorized_error_1.default('You must log in to use Unleash.');
            return res.status(error.statusCode).json(error);
        }
        const path = `${baseUriPath}/auth/simple/login`;
        const error = new server_impl_1.AuthenticationRequired({
            message: `You must log in to use Unleash. Your request had no authorization header, so we could not authorize you. Try logging in at ${path}`,
            type: 'password',
            path,
        });
        return res.status(error.statusCode).json(error);
    };
};
exports.default = authorizationMiddleware;
//# sourceMappingURL=authorization-middleware.js.map