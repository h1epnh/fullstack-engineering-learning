import type { IAuditUser, IUser } from '../types/user';
import type { IAccessInfo, IGroupWithProjectRoles, IProjectRoleUsage, IRole, IRoleDescriptor, IRoleWithPermissions, IRoleWithProject, IUserPermission, IUserRole, IUserWithProjectRoles } from '../types/stores/access-store';
import type { IUnleashStores } from '../types/stores';
import { type IAvailablePermissions, type ICustomRole, type IPermission, type IRoleData, type IUserWithRole, RoleName } from '../types/model';
import type { IGroup } from '../types/group';
import type { GroupService } from './group-service';
import { type IUnleashConfig, type IUserAccessOverview } from '../types';
import type EventService from '../features/events/event-service';
/** @deprecated prefer to use NamePermissionRef */
export type IdPermissionRef = Pick<IPermission, 'id' | 'environment'>;
export type NamePermissionRef = Pick<IPermission, 'name' | 'environment'>;
export type PermissionRef = IdPermissionRef | NamePermissionRef;
type AccessOverviewPermission = IPermission & {
    hasPermission: boolean;
};
type AccessOverview = {
    root: AccessOverviewPermission[];
    project: AccessOverviewPermission[];
    environment: AccessOverviewPermission[];
};
type APIUser = Pick<IUser, 'id' | 'permissions'> & {
    isAPI: true;
};
type NonAPIUser = Pick<IUser, 'id'> & {
    isAPI?: false;
};
export interface IRoleCreation {
    name: string;
    description: string;
    type?: 'root-custom' | 'custom';
    permissions?: PermissionRef[];
    createdBy?: string;
    createdByUserId: number;
}
export interface IRoleValidation {
    name: string;
    description?: string;
    permissions?: PermissionRef[];
}
export interface IRoleUpdate {
    id: number;
    name: string;
    description: string;
    type?: 'root-custom' | 'custom';
    permissions?: PermissionRef[];
    createdBy?: string;
    createdByUserId: number;
}
export interface AccessWithRoles {
    roles: IRoleDescriptor[];
    groups: IGroupWithProjectRoles[];
    users: IUserWithProjectRoles[];
}
export declare const cleanPermissionEnvironment: (permissions: PermissionRef[] | undefined) => PermissionRef[] | undefined;
export declare class AccessService {
    private store;
    private accountStore;
    private roleStore;
    private groupService;
    private environmentStore;
    private logger;
    private eventService;
    constructor({ accessStore, accountStore, roleStore, environmentStore, }: Pick<IUnleashStores, 'accessStore' | 'accountStore' | 'roleStore' | 'environmentStore'> & {
        groupStore?: any;
    }, // TODO remove groupStore later, kept for backward compatibility with enterprise
    { getLogger }: Pick<IUnleashConfig, 'getLogger'>, groupService: GroupService, eventService: EventService);
    private meetsAllPermissions;
    /**
     * Used to check if a user has access to the requested resource
     *
     * @param user
     * @param permission
     * @param projectId
     */
    hasPermission(user: APIUser | NonAPIUser, permission: string | string[], projectId?: string, environment?: string): Promise<boolean>;
    /**
     * Returns all roles the user has in the project.
     * Including roles via groups.
     * In addition, it includes root roles
     * @param userId user to find roles for
     * @param project project to find roles for
     */
    getAllProjectRolesForUser(userId: number, project: string): Promise<IRoleWithProject[]>;
    /**
     * Check a user against all available permissions.
     * Provided a project, project permissions will be checked against that project.
     * Provided an environment, environment permissions will be checked against that environment (and project).
     */
    getAccessOverviewForUser(user: APIUser | NonAPIUser, projectId?: string, environment?: string): Promise<AccessOverview>;
    getPermissionsForUser(user: APIUser | NonAPIUser): Promise<IUserPermission[]>;
    getPermissions(): Promise<IAvailablePermissions>;
    addUserToRole(userId: number, roleId: number, projectId: string): Promise<void>;
    addGroupToRole(groupId: number, roleId: number, createdBy: string, projectId: string): Promise<void>;
    addRoleAccessToProject(users: IAccessInfo[], groups: IAccessInfo[], projectId: string, roleId: number, auditUser: IAuditUser): Promise<void>;
    addAccessToProject(roles: number[], groups: number[], users: number[], projectId: string, createdBy: string): Promise<void>;
    setProjectRolesForUser(projectId: string, userId: number, roles: number[]): Promise<void>;
    getProjectRolesForUser(projectId: string, userId: number): Promise<number[]>;
    setProjectRolesForGroup(projectId: string, groupId: number, roles: number[], createdBy: string): Promise<void>;
    getProjectRolesForGroup(projectId: string, groupId: number): Promise<number[]>;
    getRoleByName(roleName: string): Promise<IRole>;
    removeUserAccess(projectId: string, userId: number): Promise<void>;
    removeGroupAccess(projectId: string, groupId: number): Promise<void>;
    setUserRootRole(userId: number, role: number | RoleName): Promise<void>;
    getRootRoleForUser(userId: number): Promise<IRole>;
    removeUserFromRole(userId: number, roleId: number, projectId: string): Promise<void>;
    removeGroupFromRole(groupId: number, roleId: number, projectId: string): Promise<void>;
    updateUserProjectRole(userId: number, roleId: number, projectId: string): Promise<void>;
    updateGroupProjectRole(userId: number, roleId: number, projectId: string): Promise<void>;
    addPermissionToRole(roleId: number, permission: string, environment?: string): Promise<void>;
    removePermissionFromRole(roleId: number, permission: string, environment?: string): Promise<void>;
    getRoles(): Promise<IRole[]>;
    getRole(id: number): Promise<IRoleWithPermissions>;
    getRoleData(roleId: number): Promise<IRoleData>;
    getProjectRoles(): Promise<IRole[]>;
    getRolesForProject(projectId: string): Promise<IRole[]>;
    getRolesForUser(userId: number): Promise<IRole[]>;
    wipeUserPermissions(userId: number): Promise<Array<void>>;
    getUsersForRole(roleId: number): Promise<IUser[]>;
    getGroupsForRole(roleId: number): Promise<IGroup[]>;
    getProjectUsersForRole(roleId: number, projectId?: string): Promise<IUserWithRole[]>;
    getProjectUsers(projectId: string): Promise<IUserWithProjectRoles[]>;
    getProjectRoleAccess(projectId: string): Promise<AccessWithRoles>;
    getProjectRoleUsage(roleId: number): Promise<IProjectRoleUsage[]>;
    createDefaultProjectRoles(owner: IUser, projectId: string): Promise<void>;
    removeDefaultProjectRoles(owner: IUser, projectId: string): Promise<void>;
    getRootRoleForAllUsers(): Promise<IUserRole[]>;
    getRootRoles(): Promise<IRole[]>;
    resolveRootRole(rootRole: number | RoleName): Promise<IRole | undefined>;
    getPredefinedRole(roleName: RoleName): Promise<IRole>;
    getAllRoles(): Promise<ICustomRole[]>;
    createRole(role: IRoleCreation, auditUser: IAuditUser): Promise<ICustomRole>;
    updateRole(role: IRoleUpdate, auditUser: IAuditUser): Promise<ICustomRole>;
    sanitizePermissions(permissions: IPermission[]): {
        name: string;
        environment?: string;
    }[];
    deleteRole(id: number, deletedBy: IAuditUser): Promise<void>;
    validateRoleIsUnique(roleName: string, existingId?: number): Promise<void>;
    validateRoleIsNotBuiltIn(roleId: number): Promise<void>;
    validateRole(role: IRoleValidation, existingId?: number): Promise<IRoleCreation>;
    getUserAccessOverview(): Promise<IUserAccessOverview[]>;
}
export {};
//# sourceMappingURL=access-service.d.ts.map