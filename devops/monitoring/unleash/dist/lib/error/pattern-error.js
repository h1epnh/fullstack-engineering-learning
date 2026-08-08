"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unleash_error_1 = require("./unleash-error");
class PatternError extends unleash_error_1.UnleashError {
    constructor(message, details) {
        super(message);
        this.statusCode = 400;
        this.details = details?.map((description) => ({
            message: description,
        }));
    }
    toJSON() {
        return {
            ...super.toJSON(),
            details: this.details,
        };
    }
}
exports.default = PatternError;
//# sourceMappingURL=pattern-error.js.map