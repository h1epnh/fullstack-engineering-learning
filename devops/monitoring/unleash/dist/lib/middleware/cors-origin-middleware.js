"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOriginMiddleware = exports.resolveOrigin = void 0;
const cors_1 = __importDefault(require("cors"));
const resolveOrigin = (allowedOrigins) => {
    if (allowedOrigins.length === 0) {
        return '*';
    }
    if (allowedOrigins.some((origin) => origin === '*')) {
        return '*';
    }
    else {
        return allowedOrigins;
    }
};
exports.resolveOrigin = resolveOrigin;
// Check the request's Origin header against a list of allowed origins.
// The list may include '*', which `cors` does not support natively.
const corsOriginMiddleware = ({ frontendApiService }, config) => {
    const corsFunc = (0, cors_1.default)(async (req, callback) => {
        try {
            const { frontendApiOrigins = [] } = await frontendApiService.getFrontendSettings();
            callback(null, {
                origin: (0, exports.resolveOrigin)(frontendApiOrigins),
                maxAge: config.accessControlMaxAge,
                exposedHeaders: 'ETag',
                credentials: true,
            });
        }
        catch (error) {
            callback(error);
        }
    });
    return (req, res, next) => {
        res.setHeader('Vary', 'Origin');
        corsFunc(req, res, next);
    };
};
exports.corsOriginMiddleware = corsOriginMiddleware;
//# sourceMappingURL=cors-origin-middleware.js.map