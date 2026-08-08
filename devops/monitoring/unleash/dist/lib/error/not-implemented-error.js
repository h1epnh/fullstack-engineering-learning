"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unleash_error_1 = require("./unleash-error");
class NotImplementedError extends unleash_error_1.UnleashError {
    constructor() {
        super(...arguments);
        this.statusCode = 405;
    }
}
exports.default = NotImplementedError;
module.exports = NotImplementedError;
//# sourceMappingURL=not-implemented-error.js.map