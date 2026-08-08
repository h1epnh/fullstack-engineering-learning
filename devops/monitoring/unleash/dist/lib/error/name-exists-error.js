"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unleash_error_1 = require("./unleash-error");
class NameExistsError extends unleash_error_1.UnleashError {
    constructor() {
        super(...arguments);
        this.statusCode = 409;
    }
}
exports.default = NameExistsError;
module.exports = NameExistsError;
//# sourceMappingURL=name-exists-error.js.map