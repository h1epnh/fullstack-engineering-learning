"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unleash_error_1 = require("./unleash-error");
class InvalidTokenError extends unleash_error_1.UnleashError {
    constructor() {
        super('Token was not valid');
        this.statusCode = 401;
    }
}
exports.default = InvalidTokenError;
module.exports = InvalidTokenError;
//# sourceMappingURL=invalid-token-error.js.map