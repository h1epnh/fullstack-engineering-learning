"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unleash_error_1 = require("./unleash-error");
class PasswordUndefinedError extends unleash_error_1.UnleashError {
    constructor() {
        super('Password cannot be empty or undefined');
        this.statusCode = 400;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            details: [
                {
                    validationErrors: [],
                    message: this.message,
                },
            ],
        };
    }
}
exports.default = PasswordUndefinedError;
//# sourceMappingURL=password-undefined.js.map