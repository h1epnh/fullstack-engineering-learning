"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitError = void 0;
const unleash_error_1 = require("./unleash-error");
class RateLimitError extends unleash_error_1.UnleashError {
    constructor(message = `We're currently receiving too much traffic. Please try again later.`) {
        super(message);
        this.statusCode = 429;
    }
}
exports.RateLimitError = RateLimitError;
//# sourceMappingURL=rate-limit-error.js.map