"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorFactory = exports.NotFoundError = exports.UnauthorizedError = exports.ValidationError = exports.CustomError = exports.ErrorType = void 0;
var ErrorType;
(function (ErrorType) {
    ErrorType["VALIDATION"] = "VALIDATION_ERROR";
    ErrorType["AUTHENTICATION"] = "AUTHENTICATION_ERROR";
    ErrorType["AUTHORIZATION"] = "AUTHORIZATION_ERROR";
    ErrorType["NOT_FOUND"] = "NOT_FOUND_ERROR";
    ErrorType["DATABASE"] = "DATABASE_ERROR";
    ErrorType["BUSINESS"] = "BUSINESS_ERROR";
    ErrorType["SYSTEM"] = "SYSTEM_ERROR";
})(ErrorType || (exports.ErrorType = ErrorType = {}));
class CustomError extends Error {
    constructor(type, message, status = 500, details) {
        super(message);
        this.type = type;
        this.status = status;
        this.details = details;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.CustomError = CustomError;
class ValidationError extends CustomError {
    constructor(errors) {
        super(ErrorType.VALIDATION, 'Validation Error', 400, { errors });
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends CustomError {
    constructor(message = 'Unauthorized') {
        super(ErrorType.AUTHENTICATION, message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class NotFoundError extends CustomError {
    constructor(message = 'Not Found') {
        super(ErrorType.NOT_FOUND, message, 404);
    }
}
exports.NotFoundError = NotFoundError;
// Error Factory class
class ErrorFactory {
    static validation(message, details) {
        return new CustomError(ErrorType.VALIDATION, message, 400, details);
    }
    static authentication(message) {
        return new CustomError(ErrorType.AUTHENTICATION, message, 401);
    }
    static authorization(message) {
        return new CustomError(ErrorType.AUTHORIZATION, message, 403);
    }
    static notFound(resource) {
        return new CustomError(ErrorType.NOT_FOUND, `${resource} not found`, 404);
    }
    static system(message, details) {
        return new CustomError(ErrorType.SYSTEM, message, 500, details);
    }
    static database(message, details) {
        return new CustomError(ErrorType.DATABASE, message, 500, details);
    }
    static business(message, details) {
        return new CustomError(ErrorType.BUSINESS, message, 422, details);
    }
}
exports.ErrorFactory = ErrorFactory;
