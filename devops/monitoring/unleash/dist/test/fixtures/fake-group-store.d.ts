import type { IGroupStore, IStoreGroup } from '../../lib/types/stores/group-store';
import type Group from '../../lib/types/group';
import type { ICreateGroupUserModel, IGroup, IGroupModel, IGroupProject, IGroupRole, IGroupUser } from '../../lib/types/group';
import type { IGroupWithProjectRoles } from '../../lib/types/stores/access-store';
export default class FakeGroupStore implements IGroupStore {
    count(): Promise<number>;
    data: IGroup[];
    getAll(): Promise<IGroup[]>;
    delete(id: number): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
    exists(key: number): Promise<boolean>;
    get(key: number): Promise<IGroup | undefined>;
    create(group: IStoreGroup): Promise<IGroup>;
    existsWithName(name: string): Promise<boolean>;
    addUsersToGroup(id: number, users: ICreateGroupUserModel[], userName: string): Promise<void>;
    getAllUsersByGroups(groupIds: number[]): Promise<IGroupUser[]>;
    deleteUsersFromGroup(deletableUsers: IGroupUser[]): Promise<void>;
    update(group: IGroupModel): Promise<IGroup>;
    updateGroupUsers(groupId: number, newUsers: ICreateGroupUserModel[], deletableUsers: IGroupUser[], userName: string): Promise<void>;
    getAllWithId(ids: number[]): Promise<IGroup[]>;
    getProjectGroupRoles(projectId: string): Promise<IGroupRole[]>;
    getProjectGroups(projectId: string): Promise<IGroupWithProjectRoles[]>;
    getGroupProjects(groupIds: number[]): Promise<IGroupProject[]>;
    getNewGroupsForExternalUser(userId: number, externalGroups: string[]): Promise<IGroup[]>;
    addUserToGroups(userId: number, groupIds: number[], createdBy?: string): Promise<void>;
    getOldGroupsForExternalUser(userId: number, externalGroups: string[]): Promise<IGroupUser[]>;
    getGroupsForUser(userId: number): Promise<Group[]>;
    hasProjectRole(groupId: number): Promise<boolean>;
    deleteScimGroups(): Promise<void>;
}
//# sourceMappingURL=fake-group-store.d.ts.map