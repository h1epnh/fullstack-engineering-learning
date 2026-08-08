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
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeRequestedRoute = void 0;
exports.responseTimeMetrics = responseTimeMetrics;
const responseTime = __importStar(require("response-time"));
const metric_events_1 = require("../metric-events");
const _responseTime = responseTime.default;
const appNameReportingThreshold = 1000;
const storeRequestedRoute = (req, res, next) => {
    if (req.route) {
        res.locals = {
            ...res.locals,
            route: `${req.baseUrl}${req.route.path}`,
        };
    }
    next();
};
exports.storeRequestedRoute = storeRequestedRoute;
function collapse(path) {
    let prefix = '';
    if (path) {
        if (path.startsWith('/api/admin')) {
            prefix = '/api/admin/';
        }
        else if (path.startsWith('/api/client')) {
            prefix = '/api/client/';
        }
        else if (path.startsWith('/api/frontend')) {
            prefix = '/api/frontend/';
        }
        else if (path.startsWith('/api')) {
            prefix = '/api/';
        }
        else if (path.startsWith('/edge')) {
            prefix = '/edge/';
        }
        else if (path.startsWith('/auth')) {
            prefix = '/auth/';
        }
    }
    return `${prefix}(hidden)`;
}
function responseTimeMetrics(eventBus, flagResolver, instanceStatsService) {
    return _responseTime((req, res, time) => {
        const { statusCode } = res;
        let pathname = undefined;
        if (res.locals.route) {
            pathname = res.locals.route;
        }
        else if (req.route) {
            pathname = req.baseUrl + req.route.path;
        }
        // when pathname is undefined use a fallback
        pathname = pathname ?? collapse(req.path);
        let appName;
        if (!flagResolver.isEnabled('responseTimeWithAppNameKillSwitch') &&
            (instanceStatsService.getAppCountSnapshot('7d') ??
                appNameReportingThreshold) < appNameReportingThreshold) {
            appName =
                req.headers['x-unleash-appname'] ??
                    req.headers['unleash-appname'] ??
                    req.query.appName;
        }
        if (flagResolver.isEnabled('uniqueSdkTracking')) {
            const connectionId = req.headers['unleash-connection-id'] ||
                req.headers['x-unleash-connection-id'] ||
                req.headers['unleash-instanceid'];
            if (req.originalUrl.includes('/api/client') && connectionId) {
                eventBus.emit(metric_events_1.SDK_CONNECTION_ID_RECEIVED, {
                    connectionId,
                    type: 'backend',
                });
            }
            if (req.originalUrl.includes('/api/frontend') && connectionId) {
                eventBus.emit(metric_events_1.SDK_CONNECTION_ID_RECEIVED, {
                    connectionId,
                    type: 'frontend',
                });
            }
        }
        const timingInfo = {
            path: pathname,
            method: req.method,
            statusCode,
            time,
            appName,
        };
        if (!res.locals.responseTimeEmitted) {
            res.locals.responseTimeEmitted = true;
            eventBus.emit(metric_events_1.REQUEST_TIME, timingInfo);
        }
    });
}
//# sourceMappingURL=response-time-metrics.js.map