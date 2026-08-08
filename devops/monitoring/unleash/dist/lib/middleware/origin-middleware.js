"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.originMiddleware = void 0;
const metric_events_1 = require("../metric-events");
const integration_headers_1 = require("./integration-headers");
const originMiddleware = ({ getLogger, eventBus, flagResolver, }) => {
    const logger = getLogger('/middleware/origin-middleware.ts');
    logger.debug('Enabling origin middleware');
    return (req, _, next) => {
        const isUI = !req.headers.authorization;
        if (isUI) {
            (0, metric_events_1.emitMetricEvent)(eventBus, metric_events_1.REQUEST_ORIGIN, {
                type: 'UI',
                method: req.method,
            });
        }
        else {
            const userAgent = req.headers['user-agent'];
            const uaLabel = userAgent
                ? (0, integration_headers_1.determineIntegrationSource)(userAgent)
                : 'Other';
            if (flagResolver.isEnabled('originMiddlewareRequestLogging')) {
                logger.info('API request', {
                    method: req.method,
                    userAgent: req.headers['user-agent'],
                    origin: (0, integration_headers_1.getFilteredOrigin)(req),
                });
            }
            (0, metric_events_1.emitMetricEvent)(eventBus, metric_events_1.REQUEST_ORIGIN, {
                type: 'API',
                method: req.method,
                source: uaLabel,
            });
        }
        next();
    };
};
exports.originMiddleware = originMiddleware;
//# sourceMappingURL=origin-middleware.js.map