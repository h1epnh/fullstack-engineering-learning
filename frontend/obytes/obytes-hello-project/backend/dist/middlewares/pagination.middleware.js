"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationMiddleware = void 0;
const paginationMiddleware = (req, res, next) => {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    // Validate pagination parameters
    const validatedPage = page > 0 ? page : 1;
    const validatedLimit = limit > 0 && limit <= 100 ? limit : 10;
    req.pagination = {
        page: validatedPage,
        limit: validatedLimit,
        skip: (validatedPage - 1) * validatedLimit
    };
    next();
};
exports.paginationMiddleware = paginationMiddleware;
