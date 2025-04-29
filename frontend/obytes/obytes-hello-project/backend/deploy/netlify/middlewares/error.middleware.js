"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorMiddleware = void 0;
const custom_error_1 = require("../utils/custom-error");
const sendError = (res, status, message, errors) => {
    const response = {
        success: false,
        message
    };
    if (errors) {
        response.errors = errors;
    }
    if (process.env.NODE_ENV === 'development') {
        response.stack = new Error().stack;
    }
    return res.status(status).json(response);
};
const errorMiddleware = (err, req, res, next) => {
    // Handle CustomError
    if (err instanceof custom_error_1.CustomError) {
        return sendError(res, err.status, err.message, err.details);
    }
    // Handle default Error
    console.error('Unhandled Error:', err);
    return sendError(res, 500, 'Internal Server Error', process.env.NODE_ENV === 'development' ? err.message : undefined);
};
exports.errorMiddleware = errorMiddleware;
// Async error handler wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
