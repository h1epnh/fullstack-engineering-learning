"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unleash_error_1 = require("./unleash-error");
class DisabledError extends unleash_error_1.UnleashError {
    constructor() {
        super(...arguments);
        this.statusCode = 422;
    }
}
exports.default = DisabledError;
//# sourceMappingURL=disabled-error.js.map