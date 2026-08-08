"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getApp;
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression"));
const serve_favicon_1 = __importDefault(require("serve-favicon"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const errorhandler_1 = __importDefault(require("errorhandler"));
const response_time_metrics_1 = require("./middleware/response-time-metrics");
const cors_origin_middleware_1 = require("./middleware/cors-origin-middleware");
const rbac_middleware_1 = __importDefault(require("./middleware/rbac-middleware"));
const api_token_middleware_1 = __importDefault(require("./middleware/api-token-middleware"));
const option_1 = require("./types/option");
const routes_1 = __importDefault(require("./routes"));
const request_logger_1 = __importDefault(require("./middleware/request-logger"));
const demo_authentication_1 = __importDefault(require("./middleware/demo-authentication"));
const oss_authentication_1 = __importDefault(require("./middleware/oss-authentication"));
const no_authentication_1 = __importStar(require("./middleware/no-authentication"));
const secure_headers_1 = __importDefault(require("./middleware/secure-headers"));
const load_index_html_1 = require("./util/load-index-html");
const findPublicFolder_1 = require("./util/findPublicFolder");
const pat_middleware_1 = __importDefault(require("./middleware/pat-middleware"));
const maintenance_middleware_1 = __importDefault(require("./features/maintenance/maintenance-middleware"));
const unless_middleware_1 = require("./middleware/unless-middleware");
const catch_all_error_handler_1 = require("./middleware/catch-all-error-handler");
const notfound_error_1 = __importDefault(require("./error/notfound-error"));
const bearer_token_middleware_1 = require("./middleware/bearer-token-middleware");
const middleware_1 = require("./middleware");
const origin_middleware_1 = require("./middleware/origin-middleware");
async function getApp(config, stores, services, unleashSession, db) {
    const app = (0, express_1.default)();
    const baseUriPath = config.server.baseUriPath || '';
    const publicFolder = config.publicFolder || (0, findPublicFolder_1.findPublicFolder)();
    const indexHTML = await (0, load_index_html_1.loadIndexHTML)(config, publicFolder);
    const logger = config.getLogger('lib/app.ts');
    app.set('trust proxy', true);
    app.disable('x-powered-by');
    app.set('port', config.server.port);
    app.locals.baseUriPath = baseUriPath;
    if (config.server.serverMetrics && config.eventBus) {
        app.use((0, response_time_metrics_1.responseTimeMetrics)(config.eventBus, config.flagResolver, services.instanceStatsService));
    }
    app.use((0, request_logger_1.default)(config));
    app.use(`${baseUriPath}/api`, (0, bearer_token_middleware_1.bearerTokenMiddleware)(config)); // We only need bearer token compatibility on /api paths.
    if (typeof config.preHook === 'function') {
        config.preHook(app, config, services, db);
    }
    if (!config.server.disableCompression) {
        app.use((0, compression_1.default)());
    }
    app.use((0, cookie_parser_1.default)());
    app.use((req, res, next) => {
        req.url = req.url.replace(/\/+/g, '/');
        next();
    });
    app.use(`${baseUriPath}/api/admin/features-batch`, express_1.default.json({ strict: false, limit: '500kB' }));
    app.use((0, unless_middleware_1.unless)(`${baseUriPath}/api/admin/features-batch`, express_1.default.json({ strict: false })));
    if (unleashSession) {
        app.use(unleashSession);
    }
    app.use((0, secure_headers_1.default)(config));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((0, serve_favicon_1.default)(path_1.default.join(publicFolder, 'favicon.ico')));
    app.use(baseUriPath, (0, serve_favicon_1.default)(path_1.default.join(publicFolder, 'favicon.ico')));
    app.use(baseUriPath, express_1.default.static(publicFolder, { index: false }));
    if (config.enableOAS) {
        app.use(`${baseUriPath}/oas`, express_1.default.static('docs/api/oas'));
    }
    if (config.enableOAS && services.openApiService) {
        services.openApiService.useDocs(app);
    }
    // Support CORS preflight requests for the frontend endpoints.
    // Preflight requests should not have Authorization headers,
    // so this must be handled before the API token middleware.
    app.options(`${baseUriPath}/api/frontend*`, (0, cors_origin_middleware_1.corsOriginMiddleware)(services, config));
    app.options(`${baseUriPath}/api/streaming*`, (0, cors_origin_middleware_1.corsOriginMiddleware)(services, config));
    app.use(baseUriPath, (0, pat_middleware_1.default)(config, services));
    switch (config.authentication.type) {
        case option_1.IAuthType.OPEN_SOURCE: {
            app.use(baseUriPath, (0, api_token_middleware_1.default)(config, services));
            (0, oss_authentication_1.default)(app, config.getLogger, config.server.baseUriPath);
            break;
        }
        case option_1.IAuthType.ENTERPRISE: {
            app.use(baseUriPath, (0, api_token_middleware_1.default)(config, services));
            if (config.authentication.customAuthHandler) {
                config.authentication.customAuthHandler(app, config, services);
            }
            break;
        }
        case option_1.IAuthType.HOSTED: {
            app.use(baseUriPath, (0, api_token_middleware_1.default)(config, services));
            if (config.authentication.customAuthHandler) {
                config.authentication.customAuthHandler(app, config, services);
            }
            break;
        }
        case option_1.IAuthType.DEMO: {
            app.use(baseUriPath, (0, api_token_middleware_1.default)(config, services));
            (0, demo_authentication_1.default)(app, config.server.baseUriPath, services, config);
            break;
        }
        case option_1.IAuthType.CUSTOM: {
            app.use(baseUriPath, (0, api_token_middleware_1.default)(config, services));
            if (config.authentication.customAuthHandler) {
                config.authentication.customAuthHandler(app, config, services);
            }
            break;
        }
        case option_1.IAuthType.NONE: {
            logger.warn('The AuthType=none option for Unleash is no longer recommended and will be removed in version 6.');
            (0, no_authentication_1.noApiToken)(baseUriPath, app);
            app.use(baseUriPath, (0, api_token_middleware_1.default)(config, services));
            (0, no_authentication_1.default)(baseUriPath, app);
            break;
        }
        default: {
            app.use(baseUriPath, (0, api_token_middleware_1.default)(config, services));
            (0, demo_authentication_1.default)(app, config.server.baseUriPath, services, config);
            break;
        }
    }
    app.use(baseUriPath, (0, rbac_middleware_1.default)(config, stores, services.accessService));
    app.use(`${baseUriPath}/api/admin`, (0, origin_middleware_1.originMiddleware)(config));
    app.use(`${baseUriPath}/api/admin`, (0, middleware_1.auditAccessMiddleware)(config));
    app.use(`${baseUriPath}/api/admin`, (0, maintenance_middleware_1.default)(config, services.maintenanceService));
    if (typeof config.preRouterHook === 'function') {
        config.preRouterHook(app, config, services, stores, db);
    }
    // Setup API routes
    // @ts-expect-error - our db is possibly undefined and our indexrouter doesn't currently handle that
    app.use(`${baseUriPath}/`, new routes_1.default(config, services, db).router);
    if (process.env.NODE_ENV !== 'production') {
        app.use((0, errorhandler_1.default)());
    }
    else {
        app.use((0, catch_all_error_handler_1.catchAllErrorHandler)(config.getLogger));
    }
    app.get(`${baseUriPath}`, (req, res) => {
        res.set('Content-Type', 'text/html');
        res.send(indexHTML);
    });
    // handle all API 404s
    app.use(`${baseUriPath}/api`, (req, res) => {
        const error = new notfound_error_1.default(`The path you were looking for (${baseUriPath}/api${req.path}) is not available.`);
        res.status(error.statusCode).send(error);
        return;
    });
    app.get(`${baseUriPath}/*`, (req, res) => {
        res.set('Content-Type', 'text/html');
        const requestPath = path_1.default.parse(req.url);
        // appropriately return 404 requests for assets with an extension (js, css, etc)
        if (requestPath.ext !== '' && requestPath.ext !== 'html') {
            res.set('Cache-Control', 'no-cache');
            res.status(404).send(indexHTML);
            return;
        }
        res.send(indexHTML);
    });
    return app;
}
//# sourceMappingURL=app.js.map