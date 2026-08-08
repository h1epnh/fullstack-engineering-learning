"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleType = exports.RoleName = exports.PermissionType = exports.WeightType = void 0;
var WeightType;
(function (WeightType) {
    WeightType["VARIABLE"] = "variable";
    WeightType["FIX"] = "fix";
})(WeightType || (exports.WeightType = WeightType = {}));
var PermissionType;
(function (PermissionType) {
    PermissionType["root"] = "root";
    PermissionType["project"] = "project";
})(PermissionType || (exports.PermissionType = PermissionType = {}));
var RoleName;
(function (RoleName) {
    RoleName["ADMIN"] = "Admin";
    RoleName["EDITOR"] = "Editor";
    RoleName["VIEWER"] = "Viewer";
    RoleName["OWNER"] = "Owner";
    RoleName["MEMBER"] = "Member";
})(RoleName || (exports.RoleName = RoleName = {}));
var RoleType;
(function (RoleType) {
    RoleType["ROOT"] = "root";
    RoleType["ROOT_CUSTOM"] = "root-custom";
    RoleType["PROJECT"] = "project";
})(RoleType || (exports.RoleType = RoleType = {}));
//# sourceMappingURL=model.js.map