"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = void 0;
const handleError = (res, error) => {
    console.error(error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation Error',
            errors: error.errors,
        });
    }
    if (error.name === 'UnauthorizedError') {
        return res.status(401).json({
            message: 'Unauthorized',
        });
    }
    return res.status(500).json({
        message: 'Internal Server Error',
    });
};
exports.handleError = handleError;
