"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unleash_error_1 = require("./unleash-error");
class MinimumOneEnvironmentError extends unleash_error_1.UnleashError {
    constructor() {
        super(...arguments);
        this.statusCode = 400;
    }
}
exports.default = MinimumOneEnvironmentError;
module.exports = MinimumOneEnvironmentError;
//# sourceMappingURL=minimum-one-environment-error.js.map