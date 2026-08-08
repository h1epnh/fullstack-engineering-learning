"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditAccessMiddleware = void 0;
const util_1 = require("../util");
const auditAccessMiddleware = ({ getLogger, }) => {
    const logger = getLogger('/middleware/audit-middleware.ts');
    return (req, _res, next) => {
        if (!req.user) {
            logger.info('Could not find user');
        }
        else {
            try {
                req.audit = (0, util_1.extractAuditInfo)(req);
            }
            catch (e) {
                logger.warn('Could not find audit info in request');
            }
        }
        next();
    };
};
exports.auditAccessMiddleware = auditAccessMiddleware;
//# sourceMappingURL=audit-middleware.js.map