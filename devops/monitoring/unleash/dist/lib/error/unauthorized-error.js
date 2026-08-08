"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unleash_error_1 = require("./unleash-error");
class UnauthorizedError extends unleash_error_1.UnleashError {
    constructor() {
        super(...arguments);
        this.statusCode = 401;
    }
}
exports.default = UnauthorizedError;
module.exports = UnauthorizedError;
//# sourceMappingURL=unauthorized-error.js.map