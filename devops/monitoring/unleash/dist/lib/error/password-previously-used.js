"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordPreviouslyUsedError = void 0;
const unleash_error_1 = require("./unleash-error");
class PasswordPreviouslyUsedError extends unleash_error_1.UnleashError {
    constructor(message = `You've previously used this password. Please use a new password.`) {
        super(message);
        this.statusCode = 400;
    }
}
exports.PasswordPreviouslyUsedError = PasswordPreviouslyUsedError;
//# sourceMappingURL=password-previously-used.js.map