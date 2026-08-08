"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const types_1 = require("../types");
const util_1 = require("./util");
const content_type_checker_1 = __importDefault(require("../middleware/content_type_checker"));
const error_1 = require("../error");
const bad_data_error_1 = require("../error/bad-data-error");
const response_time_metrics_1 = require("../middleware/response-time-metrics");
const checkPermission = (permission = []) => async (req, res, next) => {
    const permissions = (Array.isArray(permission) ? permission : [permission]).filter((p) => p !== types_1.NONE);
    if (!permissions.length) {
        return next();
    }
    if (req.checkRbac && (await req.checkRbac(permissions))) {
        return next();
    }
    return res.status(403).json(new error_1.PermissionError(permissions)).end();
};
const checkPrivateProjectPermissions = () => async (req, res, next) => {
    if (!req.checkPrivateProjectPermissions ||
        (await req.checkPrivateProjectPermissions())) {
        return next();
    }
    return res.status(404).end();
};
const openAPIValidationMiddleware = async (err, req, res, next) => {
    if (err?.status && err.validationErrors) {
        const apiError = (0, bad_data_error_1.fromOpenApiValidationErrors)(req, err.validationErrors);
        res.status(apiError.statusCode).json(apiError);
    }
    else {
        next(err);
    }
};
/**
 * Base class for Controllers to standardize binding to express Router.
 *
 * This class will take care of the following:
 * - try/catch inside RequestHandler
 * - await if the RequestHandler returns a promise.
 * - access control
 */
class Controller {
    constructor(config) {
        this.ownLogger = config.getLogger(`controller/${this.constructor.name}`);
        this.app = (0, express_1.Router)();
        this.config = config;
    }
    useRouteErrorHandler(handler) {
        return async (req, res) => {
            try {
                await handler(req, res);
            }
            catch (error) {
                (0, util_1.handleErrors)(res, this.ownLogger, error);
            }
        };
    }
    useContentTypeMiddleware(options) {
        const { middleware = [], acceptedContentTypes = [] } = options;
        return options.method === 'get' || options.acceptAnyContentType
            ? middleware
            : [(0, content_type_checker_1.default)(...acceptedContentTypes), ...middleware];
    }
    route(options) {
        this.app[options.method](options.path, response_time_metrics_1.storeRequestedRoute, checkPermission(options.permission), checkPrivateProjectPermissions(), this.useContentTypeMiddleware(options), this.useRouteErrorHandler(options.handler.bind(this)));
        this.app.use(options.path, openAPIValidationMiddleware);
    }
    get(path, handler, permission = types_1.NONE) {
        this.route({
            method: 'get',
            path,
            handler,
            permission,
        });
    }
    post(path, handler, permission = types_1.NONE, ...acceptedContentTypes) {
        this.route({
            method: 'post',
            path,
            handler,
            permission,
            acceptedContentTypes,
        });
    }
    put(path, handler, permission = types_1.NONE, ...acceptedContentTypes) {
        this.route({
            method: 'put',
            path,
            handler,
            permission,
            acceptedContentTypes,
        });
    }
    patch(path, handler, permission = types_1.NONE, ...acceptedContentTypes) {
        this.route({
            method: 'patch',
            path,
            handler,
            permission,
            acceptedContentTypes,
        });
    }
    delete(path, handler, permission = types_1.NONE) {
        this.route({
            method: 'delete',
            path,
            handler,
            permission,
            acceptAnyContentType: true,
        });
    }
    fileupload(path, filehandler, handler, permission = types_1.NONE) {
        this.app.post(path, response_time_metrics_1.storeRequestedRoute, checkPermission(permission), checkPrivateProjectPermissions(), filehandler.bind(this), this.useRouteErrorHandler(handler.bind(this)));
    }
    use(path, router) {
        this.app.use(path, router);
    }
    useWithMiddleware(path, router, middleware) {
        this.app.use(path, middleware, router);
    }
    get router() {
        return this.app;
    }
}
exports.default = Controller;
module.exports = Controller;
//# sourceMappingURL=controller.js.map