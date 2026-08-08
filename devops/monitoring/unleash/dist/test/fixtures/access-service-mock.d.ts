import { AccessService, type AccessWithRoles } from '../../lib/services/access-service';
import type User from '../../lib/types/user';
import type { IRole } from '../../lib/types/stores/access-store';
import { type IAvailablePermissions, RoleName } from '../../lib/types/model';
declare class AccessServiceMock extends AccessService {
    constructor();
    hasPermission(user: User, permission: string, projectId?: string): Promise<boolean>;
    getPermissions(): Promise<IAvailablePermissions>;
    addUserToRole(userId: number, roleId: number): Promise<void>;
    setUserRootRole(userId: number, roleId: number): Promise<void>;
    addPermissionToRole(roleId: number, permission: string, projectId?: string): Promise<void>;
    removePermissionFromRole(roleId: number, permission: string, projectId?: string): Promise<void>;
    getRoles(): Promise<IRole[]>;
    getRolesForProject(projectId: string): Promise<IRole[]>;
    getRolesForUser(userId: number): Promise<IRole[]>;
    getUserRootRoles(userId: number): Promise<IRole[]>;
    getUsersForRole(roleId: any): Promise<User[]>;
    getProjectRoleAccess(projectId: string): Promise<AccessWithRoles>;
    createDefaultProjectRoles(owner: User, projectId: string): Promise<void>;
    removeDefaultProjectRoles(owner: User, projectId: string): Promise<void>;
    getRootRole(roleName: RoleName): Promise<IRole>;
    getRootRoleForUser(userId: number): Promise<IRole>;
}
export default AccessServiceMock;
//# sourceMappingURL=access-service-mock.d.ts.map