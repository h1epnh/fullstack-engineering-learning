"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unleash_error_1 = require("./unleash-error");
class UsedTokenError extends unleash_error_1.UnleashError {
    constructor(usedAt) {
        super(`Token was already used at ${usedAt}`);
        this.statusCode = 403;
    }
}
exports.default = UsedTokenError;
module.exports = UsedTokenError;
//# sourceMappingURL=used-token-error.js.map