"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogin = exports.validateRegister = void 0;
const custom_error_1 = require("../utils/custom-error");
const validation_utils_1 = require("../utils/validation.utils");
const validateRegister = (req, res, next) => {
    const { email, password, name, phone } = req.body;
    const errors = [];
    if (!email || !(0, validation_utils_1.validateEmail)(email)) {
        errors.push('Invalid email address');
    }
    if (!password || !(0, validation_utils_1.validatePassword)(password)) {
        errors.push('Password must be at least 8 characters long');
    }
    if (!name || name.length < 2) {
        errors.push('Name must be at least 2 characters long');
    }
    if (phone && !(0, validation_utils_1.validatePhone)(phone)) {
        errors.push('Invalid phone number');
    }
    if (errors.length > 0) {
        throw new custom_error_1.ValidationError(errors);
    }
    next();
};
exports.validateRegister = validateRegister;
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];
    if (!email || !(0, validation_utils_1.validateEmail)(email)) {
        errors.push('Invalid email address');
    }
    if (!password) {
        errors.push('Password is required');
    }
    if (errors.length > 0) {
        throw new custom_error_1.ValidationError(errors);
    }
    next();
};
exports.validateLogin = validateLogin;
