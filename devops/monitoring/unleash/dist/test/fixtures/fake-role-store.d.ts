import type { RoleSchema } from '../../lib/openapi';
import type { ICustomRole } from '../../lib/types/model';
import type { IRole, IUserRole } from '../../lib/types/stores/access-store';
import type { ICustomRoleInsert, ICustomRoleUpdate, IRoleStore } from '../../lib/types/stores/role-store';
export default class FakeRoleStore implements IRoleStore {
    count(): Promise<number>;
    filteredCount(search: Partial<RoleSchema>): Promise<number>;
    filteredCountInUse(search: Partial<RoleSchema>): Promise<number>;
    roles: ICustomRole[];
    getGroupRolesForProject(projectId: string): Promise<IRole[]>;
    nameInUse(name: string, existingId?: number): Promise<boolean>;
    getAll(): Promise<ICustomRole[]>;
    create(role: ICustomRoleInsert): Promise<ICustomRole>;
    update(role: ICustomRoleUpdate): Promise<ICustomRole>;
    delete(id: number): Promise<void>;
    getRoles(): Promise<IRole[]>;
    getRoleByName(name: string): Promise<IRole>;
    getRolesForProject(projectId: string): Promise<IRole[]>;
    removeRolesForProject(projectId: string): Promise<void>;
    getProjectRoles(): Promise<IRole[]>;
    getRootRoles(): Promise<IRole[]>;
    getRootRoleForAllUsers(): Promise<IUserRole[]>;
    get(id: number): Promise<ICustomRole>;
    exists(key: number): Promise<boolean>;
    deleteAll(): Promise<void>;
    destroy(): void;
}
//# sourceMappingURL=fake-role-store.d.ts.map