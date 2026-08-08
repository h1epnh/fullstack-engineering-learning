"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unleash_error_1 = require("./unleash-error");
class InvalidOperationError extends unleash_error_1.UnleashError {
    constructor() {
        super(...arguments);
        this.statusCode = 403;
    }
}
exports.default = InvalidOperationError;
module.exports = InvalidOperationError;
//# sourceMappingURL=invalid-operation-error.js.map