"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.AuthError = void 0;
class AuthError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.status = status;
        this.name = 'AuthError';
    }
}
exports.AuthError = AuthError;
class ValidationError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.status = status;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
