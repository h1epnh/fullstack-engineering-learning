"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDuration = exports.validatePrice = exports.validateDate = exports.validatePhone = exports.validatePassword = exports.validateEmail = void 0;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const validatePassword = (password) => {
    return password.length >= 8;
};
exports.validatePassword = validatePassword;
const validatePhone = (phone) => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
};
exports.validatePhone = validatePhone;
const validateDate = (date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
};
exports.validateDate = validateDate;
const validatePrice = (price) => {
    return price > 0;
};
exports.validatePrice = validatePrice;
const validateDuration = (duration) => {
    return duration > 0 && duration <= 480; // Max 8 hours
};
exports.validateDuration = validateDuration;
