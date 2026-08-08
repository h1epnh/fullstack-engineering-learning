"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-unused-vars */
class FakeGroupStore {
    count() {
        return Promise.resolve(0);
    }
    async getAll() {
        return Promise.resolve(this.data);
    }
    async delete(id) {
        this.data = this.data.filter((item) => item.id !== id);
        return Promise.resolve();
    }
    deleteAll() {
        return Promise.resolve(undefined);
    }
    destroy() { }
    async exists(key) {
        return this.data.some((u) => u.id === key);
    }
    async get(key) {
        return this.data.find((u) => u.id === key);
    }
    create(group) {
        throw new Error('Method not implemented.');
    }
    existsWithName(name) {
        throw new Error('Method not implemented.');
    }
    addUsersToGroup(id, users, userName) {
        throw new Error('Method not implemented.');
    }
    getAllUsersByGroups(groupIds) {
        throw new Error('Method not implemented.');
    }
    deleteUsersFromGroup(deletableUsers) {
        throw new Error('Method not implemented.');
    }
    update(group) {
        throw new Error('Method not implemented.');
    }
    updateGroupUsers(groupId, newUsers, deletableUsers, userName) {
        throw new Error('Method not implemented.');
    }
    getAllWithId(ids) {
        throw new Error('Method not implemented.');
    }
    getProjectGroupRoles(projectId) {
        throw new Error('Method not implemented.');
    }
    getProjectGroups(projectId) {
        throw new Error('Method not implemented.');
    }
    getGroupProjects(groupIds) {
        throw new Error('Method not implemented.');
    }
    getNewGroupsForExternalUser(userId, externalGroups) {
        throw new Error('Method not implemented.');
    }
    addUserToGroups(userId, groupIds, createdBy) {
        throw new Error('Method not implemented.');
    }
    getOldGroupsForExternalUser(userId, externalGroups) {
        throw new Error('Method not implemented.');
    }
    getGroupsForUser(userId) {
        throw new Error('Method not implemented.');
    }
    hasProjectRole(groupId) {
        throw new Error('Method not implemented.');
    }
    deleteScimGroups() {
        throw new Error('Method not implemented.');
    }
}
exports.default = FakeGroupStore;
//# sourceMappingURL=fake-group-store.js.map