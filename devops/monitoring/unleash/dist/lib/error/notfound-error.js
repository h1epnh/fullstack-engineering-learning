"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unleash_error_1 = require("./unleash-error");
class NotFoundError extends unleash_error_1.UnleashError {
    constructor(message = 'The requested resource could not be found') {
        super(message);
        this.statusCode = 404;
    }
}
exports.default = NotFoundError;
module.exports = NotFoundError;
//# sourceMappingURL=notfound-error.js.map