"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
const access_service_1 = require("../../lib/services/access-service");
const no_logger_1 = __importDefault(require("./no-logger"));
const model_1 = require("../../lib/types/model");
class AccessServiceMock extends access_service_1.AccessService {
    constructor() {
        super({
            // @ts-expect-error - We're mocking the service so we don't need the store
            accessStore: undefined,
            // @ts-expect-error - We're mocking the service so we don't need the store
            accountStore: undefined,
            // @ts-expect-error - We're mocking the service so we don't need the store
            roleStore: undefined,
            // @ts-expect-error - We're mocking the service so we don't need the store
            environmentStore: undefined,
        }, { getLogger: no_logger_1.default }, undefined, undefined);
    }
    hasPermission(user, permission, projectId) {
        throw new Error('Method not implemented.');
    }
    getPermissions() {
        throw new Error('Method not implemented.');
    }
    addUserToRole(userId, roleId) {
        throw new Error('Method not implemented.');
    }
    setUserRootRole(userId, roleId) {
        return Promise.resolve();
    }
    addPermissionToRole(roleId, permission, projectId) {
        throw new Error('Method not implemented.');
    }
    removePermissionFromRole(roleId, permission, projectId) {
        throw new Error('Method not implemented.');
    }
    getRoles() {
        throw new Error('Method not implemented.');
    }
    getRolesForProject(projectId) {
        throw new Error('Method not implemented.');
    }
    getRolesForUser(userId) {
        return Promise.resolve([{ id: 1, name: 'Admin', type: 'root' }]);
    }
    getUserRootRoles(userId) {
        return Promise.resolve([{ id: 1, name: 'Admin', type: 'root' }]);
    }
    getUsersForRole(roleId) {
        throw new Error('Method not implemented.');
    }
    getProjectRoleAccess(projectId) {
        throw new Error('Method not implemented.');
    }
    createDefaultProjectRoles(owner, projectId) {
        throw new Error('Method not implemented.');
    }
    removeDefaultProjectRoles(owner, projectId) {
        throw new Error('Method not implemented.');
    }
    getRootRole(roleName) {
        return Promise.resolve({ id: 1, name: roleName, type: 'root' });
    }
    getRootRoleForUser(userId) {
        return Promise.resolve({ id: 1, name: model_1.RoleName.VIEWER, type: 'root' });
    }
}
exports.default = AccessServiceMock;
//# sourceMappingURL=access-service-mock.js.map