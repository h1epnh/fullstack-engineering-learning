"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unleash_error_1 = require("./unleash-error");
class RoleInUseError extends unleash_error_1.UnleashError {
    constructor() {
        super(...arguments);
        this.statusCode = 400;
    }
}
exports.default = RoleInUseError;
//# sourceMappingURL=role-in-use-error.js.map