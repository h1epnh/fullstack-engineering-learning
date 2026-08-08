"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unleash_error_1 = require("./unleash-error");
class IncompatibleProjectError extends unleash_error_1.UnleashError {
    constructor(targetProject) {
        super(`${targetProject} is not a compatible target`);
        this.statusCode = 403;
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
exports.default = IncompatibleProjectError;
//# sourceMappingURL=incompatible-project-error.js.map