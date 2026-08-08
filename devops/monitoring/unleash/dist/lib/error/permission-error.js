"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unleash_error_1 = require("./unleash-error");
class PermissionError extends unleash_error_1.UnleashError {
    constructor(permission = [], environment) {
        const permissions = Array.isArray(permission)
            ? permission
            : [permission];
        const permissionsMessage = permissions.length === 1
            ? `the "${permissions[0]}" permission`
            : `one of the following permissions: ${permissions
                .map((perm) => `"${perm}"`)
                .join(', ')}`;
        const message = `You don't have the required permissions to perform this operation. To perform this action, you need ${permissionsMessage}${environment ? ` in the "${environment}" environment.` : `.`}`;
        super(message);
        this.statusCode = 403;
        this.permissions = permissions;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            permissions: this.permissions,
        };
    }
}
exports.default = PermissionError;
module.exports = PermissionError;
//# sourceMappingURL=permission-error.js.map