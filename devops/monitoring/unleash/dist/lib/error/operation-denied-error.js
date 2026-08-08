"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationDeniedError = void 0;
const unleash_error_1 = require("./unleash-error");
class OperationDeniedError extends unleash_error_1.UnleashError {
    constructor() {
        super(...arguments);
        this.statusCode = 403;
    }
}
exports.OperationDeniedError = OperationDeniedError;
//# sourceMappingURL=operation-denied-error.js.map