"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUCCESS_MESSAGES = exports.ERROR_MESSAGES = exports.MAX_PAGE_SIZE = exports.DEFAULT_PAGE_SIZE = exports.SALT_ROUNDS = exports.JWT_EXPIRES_IN = void 0;
exports.JWT_EXPIRES_IN = '1d';
exports.SALT_ROUNDS = 10;
exports.DEFAULT_PAGE_SIZE = 10;
exports.MAX_PAGE_SIZE = 100;
exports.ERROR_MESSAGES = {
    UNAUTHORIZED: 'Unauthorized access',
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_NOT_FOUND: 'User not found',
    SERVICE_NOT_FOUND: 'Service not found',
    APPOINTMENT_NOT_FOUND: 'Appointment not found',
    INVALID_TOKEN: 'Invalid token',
    TOKEN_EXPIRED: 'Token has expired',
    VALIDATION_ERROR: 'Validation error',
    INTERNAL_SERVER_ERROR: 'Internal server error',
};
exports.SUCCESS_MESSAGES = {
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
    USER_DELETED: 'User deleted successfully',
    SERVICE_CREATED: 'Service created successfully',
    SERVICE_UPDATED: 'Service updated successfully',
    SERVICE_DELETED: 'Service deleted successfully',
    APPOINTMENT_CREATED: 'Appointment created successfully',
    APPOINTMENT_CANCELLED: 'Appointment cancelled successfully',
};
