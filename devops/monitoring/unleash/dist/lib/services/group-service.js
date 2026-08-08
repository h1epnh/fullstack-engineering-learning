"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupService = void 0;
const types_1 = require("../types");
const bad_data_error_1 = __importDefault(require("../error/bad-data-error"));
const events_1 = require("../types/events");
const name_exists_error_1 = __importDefault(require("../error/name-exists-error"));
const group_store_1 = require("../db/group-store");
const error_1 = require("../error");
const setsAreEqual = (firstSet, secondSet) => firstSet.size === secondSet.size &&
    [...firstSet].every((x) => secondSet.has(x));
class GroupService {
    constructor(stores, { getLogger }, eventService) {
        this.logger = getLogger('service/group-service.js');
        this.groupStore = stores.groupStore;
        this.eventService = eventService;
        this.accountStore = stores.accountStore;
    }
    async getAll() {
        const groups = await this.groupStore.getAll();
        const allGroupUsers = await this.groupStore.getAllUsersByGroups(groups.map((g) => g.id));
        const users = await this.accountStore.getAllWithId(allGroupUsers.map((u) => u.userId));
        const groupProjects = await this.groupStore.getGroupProjects(groups.map((g) => g.id));
        return groups.map((group) => {
            const mappedGroup = this.mapGroupWithUsers(group, allGroupUsers, users);
            return this.mapGroupWithProjects(groupProjects, mappedGroup);
        });
    }
    async getAllWithId(ids) {
        return this.groupStore.getAllWithId(ids);
    }
    mapGroupWithProjects(groupProjects, group) {
        return {
            ...group,
            projects: groupProjects
                .filter((project) => project.groupId === group.id)
                .map((project) => project.project),
        };
    }
    async getGroup(id) {
        const group = await this.groupStore.get(id);
        if (group === undefined) {
            throw new error_1.NotFoundError(`Could not find group with id ${id}`);
        }
        const groupUsers = await this.groupStore.getAllUsersByGroups([id]);
        const users = await this.accountStore.getAllWithId(groupUsers.map((u) => u.userId));
        return this.mapGroupWithUsers(group, groupUsers, users);
    }
    async isScimGroup(id) {
        const group = await this.groupStore.get(id);
        return Boolean(group?.scimId);
    }
    async createGroup(group, auditUser) {
        await this.validateGroup(group);
        const newGroup = await this.groupStore.create(group);
        if (group.users) {
            await this.groupStore.addUsersToGroup(newGroup.id, group.users, auditUser.username);
        }
        const newUserIds = group.users?.map((g) => g.user.id);
        await this.eventService.storeEvent({
            type: events_1.GROUP_CREATED,
            createdBy: auditUser.username,
            createdByUserId: auditUser.id,
            ip: auditUser.ip,
            data: { ...group, users: newUserIds },
        });
        return newGroup;
    }
    async updateGroup(group, auditUser) {
        const existingGroup = await this.groupStore.get(group.id);
        await this.validateGroup(group, existingGroup);
        const newGroup = await this.groupStore.update(group);
        const existingUsers = await this.groupStore.getAllUsersByGroups([
            group.id,
        ]);
        const existingUserIds = existingUsers.map((g) => g.userId);
        const deletableUsers = existingUsers.filter((existingUser) => !group.users.some((groupUser) => groupUser.user.id === existingUser.userId));
        await this.groupStore.updateGroupUsers(newGroup.id, group.users.filter((user) => !existingUserIds.includes(user.user.id)), deletableUsers, auditUser.username);
        const newUserIds = group.users.map((g) => g.user.id);
        await this.eventService.storeEvent(new types_1.GroupUpdatedEvent({
            data: { ...newGroup, users: newUserIds },
            preData: { ...existingGroup, users: existingUserIds },
            auditUser,
        }));
        return newGroup;
    }
    async getProjectGroups(projectId) {
        const projectGroups = await this.groupStore.getProjectGroups(projectId);
        if (projectGroups.length > 0) {
            const groups = await this.groupStore.getAllWithId(projectGroups.map((g) => g.id));
            const groupUsers = await this.groupStore.getAllUsersByGroups(groups.map((g) => g.id));
            const users = await this.accountStore.getAllWithId(groupUsers.map((u) => u.userId));
            return groups.flatMap((group) => {
                return projectGroups
                    .filter((gr) => gr.id === group.id)
                    .map((groupRole) => ({
                    ...this.mapGroupWithUsers(group, groupUsers, users),
                    ...groupRole,
                }));
            });
        }
        return [];
    }
    async deleteGroup(id, auditUser) {
        const group = await this.groupStore.get(id);
        if (group === undefined) {
            /// Group was already deleted, or never existed, do nothing
            return;
        }
        const existingUsers = await this.groupStore.getAllUsersByGroups([
            group.id,
        ]);
        const existingUserIds = existingUsers.map((g) => g.userId);
        await this.groupStore.delete(id);
        await this.eventService.storeEvent(new types_1.GroupDeletedEvent({
            preData: { ...group, users: existingUserIds },
            auditUser,
        }));
    }
    async validateGroup(group, existingGroup) {
        if (!group.name) {
            throw new bad_data_error_1.default('Group name cannot be empty');
        }
        if (!existingGroup || existingGroup.name !== group.name) {
            if (await this.groupStore.existsWithName(group.name)) {
                throw new name_exists_error_1.default('Group name already exists');
            }
        }
        if (existingGroup && Boolean(existingGroup.scimId)) {
            if (existingGroup.name !== group.name) {
                throw new bad_data_error_1.default('Cannot update the name of a SCIM group');
            }
            const existingUsers = new Set((await this.groupStore.getAllUsersByGroups([
                existingGroup.id,
            ])).map((g) => g.userId));
            const newUsers = new Set(group.users?.map((g) => g.user.id) || []);
            if (!setsAreEqual(existingUsers, newUsers)) {
                throw new bad_data_error_1.default('Cannot update users of a SCIM group');
            }
        }
    }
    async getRolesForProject(projectId) {
        return this.groupStore.getProjectGroupRoles(projectId);
    }
    async syncExternalGroups(userId, externalGroups, createdBy, // deprecated
    createdByUserId) {
        if (Array.isArray(externalGroups)) {
            const newGroups = await this.groupStore.getNewGroupsForExternalUser(userId, externalGroups);
            await this.groupStore.addUserToGroups(userId, newGroups.map((g) => g.id), group_store_1.SSO_SYNC_USER);
            const oldGroups = await this.groupStore.getOldGroupsForExternalUser(userId, externalGroups);
            await this.groupStore.deleteUsersFromGroup(oldGroups);
            const events = [];
            for (const group of newGroups) {
                events.push(new events_1.GroupUserAdded({
                    userId,
                    groupId: group.id,
                    auditUser: types_1.SYSTEM_USER_AUDIT,
                }));
            }
            for (const group of oldGroups) {
                events.push(new events_1.GroupUserRemoved({
                    userId,
                    groupId: group.groupId,
                    auditUser: types_1.SYSTEM_USER_AUDIT,
                }));
            }
            await this.eventService.storeEvents(events);
        }
    }
    async deleteScimGroups(auditUser) {
        await this.groupStore.deleteScimGroups();
        await this.eventService.storeEvent(new events_1.ScimGroupsDeleted({
            data: null,
            auditUser,
        }));
    }
    mapGroupWithUsers(group, allGroupUsers, allUsers) {
        const groupUsers = allGroupUsers.filter((user) => user.groupId === group.id);
        const groupUsersId = groupUsers.map((user) => user.userId);
        const selectedUsers = allUsers.filter((user) => groupUsersId.includes(user.id));
        const finalUsers = selectedUsers.map((user) => {
            const roleUser = groupUsers.find((gu) => gu.userId === user.id);
            return {
                user: user,
                joinedAt: roleUser?.joinedAt,
                createdBy: roleUser?.createdBy,
            };
        });
        return { ...group, users: finalUsers };
    }
    async getGroupsForUser(userId) {
        return this.groupStore.getGroupsForUser(userId);
    }
}
exports.GroupService = GroupService;
//# sourceMappingURL=group-service.js.map