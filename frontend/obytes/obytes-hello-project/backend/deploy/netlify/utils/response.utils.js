"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendResponse = void 0;
const sendResponse = (res, statusCode, data, message) => {
    const response = {
        success: statusCode < 400,
        data,
        message,
    };
    return res.status(statusCode).json(response);
};
exports.sendResponse = sendResponse;
const sendError = (res, statusCode, message, errors) => {
    const response = {
        success: false,
        error: message,
        data: null,
    };
    return res.status(statusCode).json(response);
};
exports.sendError = sendError;
