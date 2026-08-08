"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unleash_error_1 = require("./unleash-error");
class OwaspValidationError extends unleash_error_1.UnleashError {
    constructor(testResult) {
        const details = {
            validationErrors: testResult.errors,
            message: testResult.errors[0],
        };
        super(testResult.errors[0]);
        this.statusCode = 400;
        this.details = [details];
    }
    toJSON() {
        return {
            ...super.toJSON(),
            details: this.details,
        };
    }
}
exports.default = OwaspValidationError;
module.exports = OwaspValidationError;
//# sourceMappingURL=owasp-validation-error.js.map