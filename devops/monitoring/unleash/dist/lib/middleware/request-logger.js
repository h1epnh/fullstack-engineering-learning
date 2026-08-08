"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = __importDefault(require("url"));
const requestLogger = (config) => {
    const logger = config.getLogger('HTTP');
    const enable = config.server.enableRequestLogger;
    return (req, res, next) => {
        if (enable) {
            res.on('finish', () => {
                const { pathname } = url_1.default.parse(req.originalUrl);
                logger.info(`${res.statusCode} ${req.method} ${pathname}`);
            });
        }
        next();
    };
};
exports.default = requestLogger;
//# sourceMappingURL=request-logger.js.map