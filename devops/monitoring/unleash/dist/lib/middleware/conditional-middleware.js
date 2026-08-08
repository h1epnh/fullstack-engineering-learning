"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conditionalMiddleware = void 0;
const express_1 = require("express");
const conditionalMiddleware = (condition, middleware) => {
    const router = (0, express_1.Router)();
    router.use((req, res, next) => {
        if (condition()) {
            middleware(req, res, next);
        }
        else {
            next();
        }
    });
    return router;
};
exports.conditionalMiddleware = conditionalMiddleware;
//# sourceMappingURL=conditional-middleware.js.map