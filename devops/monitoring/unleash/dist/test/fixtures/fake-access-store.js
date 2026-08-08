"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeAccessStore = void 0;
const types_1 = require("../../lib/types");
const fake_role_store_1 = __importDefault(require("./fake-role-store"));
class FakeAccessStore {
    constructor(roleStore) {
        this.userToRoleMap = new Map();
        this.rolePermissions = new Map();
        this.fakeRolesStore = roleStore ?? new fake_role_store_1.default();
    }
    getProjectUserAndGroupCountsForRole(roleId) {
        throw new Error('Method not implemented.');
    }
    getAllProjectRolesForUser(userId, project) {
        throw new Error('Method not implemented.');
    }
    addRoleAccessToProject(users, groups, projectId, roleId, createdBy) {
        throw new Error('Method not implemented.');
    }
    addAccessToProject(roles, groups, users, projectId, createdBy) {
        throw new Error('Method not implemented.');
    }
    updateGroupProjectRole(userId, roleId, projectId) {
        throw new Error('Method not implemented.');
    }
    addGroupToRole(groupId, roleId, created_by, projectId) {
        throw new Error('Method not implemented.');
    }
    removeGroupFromRole(groupId, roleId, projectId) {
        throw new Error('Method not implemented.');
    }
    updateUserProjectRole(userId, roleId, projectId) {
        throw new Error('Method not implemented.');
    }
    removeUserFromRole(userId, roleId, projectId) {
        throw new Error('Method not implemented.');
    }
    wipePermissionsFromRole(role_id) {
        throw new Error('Method not implemented.');
    }
    unlinkUserRoles(userId) {
        throw new Error('Method not implemented.');
    }
    getRoleByName(name) {
        throw new Error('Method not implemented.');
    }
    getProjectUsersForRole(roleId, projectId) {
        throw new Error('Method not implemented.');
    }
    getProjectUsers(projectId) {
        throw new Error('Method not implemented.');
    }
    getProjectRoles() {
        throw new Error('Method not implemented.');
    }
    addEnvironmentPermissionsToRole(role_id, permissions) {
        return Promise.resolve(undefined);
    }
    getAvailablePermissions() {
        throw new Error('Method not implemented.');
    }
    getPermissionsForUser(userId) {
        return Promise.resolve([]);
    }
    getPermissionsForRole(roleId) {
        const found = this.rolePermissions.get(roleId) ?? [];
        return Promise.resolve(found);
    }
    getRoles() {
        return Promise.resolve([]);
    }
    getRoleWithId(id) {
        throw new Error('Method not implemented.');
    }
    getRolesForProject(projectId) {
        throw new Error('Method not implemented.');
    }
    removeRolesForProject(projectId) {
        throw new Error('Method not implemented.');
    }
    async getRolesForUserId(userId) {
        const roleId = this.userToRoleMap.get(userId);
        const found = roleId === undefined
            ? undefined
            : await this.fakeRolesStore.get(roleId);
        if (found) {
            return Promise.resolve([found]);
        }
        else {
            return Promise.resolve([]);
        }
    }
    getUserIdsForRole(roleId, projectId) {
        throw new Error('Method not implemented.');
    }
    getGroupIdsForRole(roleId, projectId) {
        throw new Error('Method not implemented.');
    }
    addUserToRole(userId, roleId) {
        this.userToRoleMap.set(userId, roleId);
        return Promise.resolve(undefined);
    }
    addPermissionsToRole(role_id, permissions, environment) {
        this.rolePermissions.set(role_id, (environment
            ? permissions.map((p) => ({ ...p, environment }))
            : permissions));
        return Promise.resolve(undefined);
    }
    removePermissionFromRole(roleId, permission, projectId) {
        throw new Error('Method not implemented.');
    }
    getRootRoleForAllUsers() {
        throw new Error('Method not implemented.');
    }
    delete(key) {
        return Promise.resolve(undefined);
    }
    deleteAll() {
        return Promise.resolve(undefined);
    }
    destroy() { }
    exists(key) {
        return Promise.resolve(false);
    }
    get(key) {
        throw new Error('Not implemented yet');
    }
    getAll() {
        return Promise.resolve([]);
    }
    getRootRoles() {
        return Promise.resolve([]);
    }
    removeRolesOfTypeForUser(userId, roleTypes) {
        return Promise.resolve(undefined);
    }
    cloneEnvironmentPermissions(sourceEnvironment, destinationEnvironment) {
        return Promise.resolve(undefined);
    }
    clearUserPersonalAccessTokens(userId) {
        return Promise.resolve(undefined);
    }
    unlinkUserGroups(userId) {
        return Promise.resolve(undefined);
    }
    clearPublicSignupUserTokens(userId) {
        return Promise.resolve(undefined);
    }
    getProjectRolesForGroup(projectId, groupId) {
        throw new Error('Method not implemented.');
    }
    getProjectRolesForUser(projectId, userId) {
        throw new Error('Method not implemented.');
    }
    setProjectRolesForGroup(projectId, groupId, roles, createdBy) {
        throw new Error('Method not implemented.');
    }
    setProjectRolesForUser(projectId, userId, roles) {
        throw new Error('Method not implemented.');
    }
    removeUserAccess(projectId, userId) {
        throw new Error('Method not implemented.');
    }
    removeGroupAccess(projectId, groupId) {
        throw new Error('Method not implemented.');
    }
    getUserAccessOverview() {
        throw new Error('Method not implemented.');
    }
    getRootRoleForUser(userId) {
        const roleId = this.userToRoleMap.get(userId);
        if (roleId !== undefined) {
            return Promise.resolve(this.fakeRolesStore.get(roleId));
        }
        else {
            return Promise.resolve({
                id: -1,
                name: types_1.RoleName.VIEWER,
                type: types_1.RoleType.ROOT,
            });
        }
    }
}
exports.FakeAccessStore = FakeAccessStore;
module.exports = FakeAccessStore;
exports.default = FakeAccessStore;
//# sourceMappingURL=fake-access-store.js.map