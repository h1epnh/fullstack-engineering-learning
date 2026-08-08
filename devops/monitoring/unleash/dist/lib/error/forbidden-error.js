"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unleash_error_1 = require("./unleash-error");
class ForbiddenError extends unleash_error_1.UnleashError {
    constructor() {
        super(...arguments);
        this.statusCode = 403;
    }
}
exports.default = ForbiddenError;
module.exports = ForbiddenError;
//# sourceMappingURL=forbidden-error.js.map