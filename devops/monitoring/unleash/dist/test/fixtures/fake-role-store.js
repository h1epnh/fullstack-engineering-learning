"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FakeRoleStore {
    constructor() {
        this.roles = [];
    }
    count() {
        return Promise.resolve(0);
    }
    filteredCount(search) {
        return Promise.resolve(0);
    }
    filteredCountInUse(search) {
        return Promise.resolve(0);
    }
    getGroupRolesForProject(projectId) {
        throw new Error('Method not implemented.');
    }
    nameInUse(name, existingId) {
        return Promise.resolve(this.roles.find((r) => r.name === name) !== undefined);
    }
    async getAll() {
        return this.roles;
    }
    async create(role) {
        const roleCreated = {
            ...role,
            type: role.roleType,
            id: this.roles.length,
            roleType: undefined, // roleType is not part of ICustomRole and simulates what the DB responds
        };
        this.roles.push(roleCreated);
        return Promise.resolve(roleCreated);
    }
    update(role) {
        throw new Error('Method not implemented.');
    }
    delete(id) {
        throw new Error('Method not implemented.');
    }
    getRoles() {
        throw new Error('Method not implemented.');
    }
    async getRoleByName(name) {
        return this.roles.find((r) => r.name === name);
    }
    getRolesForProject(projectId) {
        throw new Error('Method not implemented.');
    }
    removeRolesForProject(projectId) {
        throw new Error('Method not implemented.');
    }
    getProjectRoles() {
        throw new Error('Method not implemented.');
    }
    async getRootRoles() {
        return this.roles;
    }
    getRootRoleForAllUsers() {
        throw new Error('Method not implemented.');
    }
    get(id) {
        const found = this.roles.find((r) => r.id === id);
        if (!found) {
            // this edge case is not properly contemplated in the type definition
            throw new Error('Not found');
        }
        return Promise.resolve(found);
    }
    exists(key) {
        throw new Error('Method not implemented.');
    }
    deleteAll() {
        throw new Error('Method not implemented.');
    }
    destroy() {
        throw new Error('Method not implemented.');
    }
}
exports.default = FakeRoleStore;
//# sourceMappingURL=fake-role-store.js.map