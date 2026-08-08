"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAINTENANCE_MODE_ENABLED = void 0;
exports.MAINTENANCE_MODE_ENABLED = 'Unleash is currently in maintenance mode.';
const maintenanceMiddleware = ({ getLogger }, maintenanceService) => {
    const logger = getLogger('/middleware/maintenance-middleware.ts');
    logger.debug('Enabling Maintenance middleware');
    return async (req, res, next) => {
        const isProtectedPath = !req.path.includes('/maintenance');
        const writeMethod = ['POST', 'PUT', 'DELETE'].includes(req.method);
        if (isProtectedPath &&
            writeMethod &&
            (await maintenanceService.isMaintenanceMode())) {
            res.status(503).send({
                message: exports.MAINTENANCE_MODE_ENABLED,
            });
        }
        else {
            next();
        }
    };
};
exports.default = maintenanceMiddleware;
//# sourceMappingURL=maintenance-middleware.js.map