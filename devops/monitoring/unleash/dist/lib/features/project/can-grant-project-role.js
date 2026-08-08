"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canGrantProjectRole = void 0;
const canGrantProjectRole = (granterPermissions, receiverPermissions) => {
    return receiverPermissions.every((receiverPermission) => {
        return granterPermissions.some((granterPermission) => {
            if (granterPermission.environment) {
                return (granterPermission.permission === receiverPermission.name &&
                    granterPermission.environment ===
                        receiverPermission.environment);
            }
            return granterPermission.permission === receiverPermission.name;
        });
    });
};
exports.canGrantProjectRole = canGrantProjectRole;
//# sourceMappingURL=can-grant-project-role.js.map