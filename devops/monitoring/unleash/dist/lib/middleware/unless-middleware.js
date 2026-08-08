"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unless = void 0;
const unless = (path, middleware) => (req, res, next) => {
    if (path === req.path) {
        return next();
    }
    else {
        return middleware(req, res, next);
    }
};
exports.unless = unless;
//# sourceMappingURL=unless-middleware.js.map