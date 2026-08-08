"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bearerTokenMiddleware = void 0;
const bearerTokenMiddleware = ({ getLogger, }) => {
    const logger = getLogger('/middleware/bearer-token-middleware.ts');
    logger.debug('Enabling bearer token middleware');
    return (req, _, next) => {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            req.headers.authorization = authHeader.replace(/^Bearer\s+/i, '');
        }
        next();
    };
};
exports.bearerTokenMiddleware = bearerTokenMiddleware;
//# sourceMappingURL=bearer-token-middleware.js.map