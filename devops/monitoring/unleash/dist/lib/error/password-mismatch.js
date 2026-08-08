"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unleash_error_1 = require("./unleash-error");
class PasswordMismatch extends unleash_error_1.UnleashError {
    constructor(message = 'Wrong password, try again.') {
        super(message);
        this.statusCode = 401;
    }
}
exports.default = PasswordMismatch;
//# sourceMappingURL=password-mismatch.js.map