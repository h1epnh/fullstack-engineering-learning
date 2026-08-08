import type EventEmitter from 'events';
import type { LogProvider } from '../logger';
import type { ICustomRole } from '../types/model';
import type { ICustomRoleInsert, ICustomRoleUpdate, IRoleStore } from '../types/stores/role-store';
import type { IRole, IUserRole } from '../types/stores/access-store';
import type { Db } from './db';
import type { RoleSchema } from '../openapi';
interface IRoleRow {
    id: number;
    name: string;
    description: string;
    type: string;
}
export default class RoleStore implements IRoleStore {
    private logger;
    private eventBus;
    private db;
    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider);
    getAll(): Promise<ICustomRole[]>;
    count(): Promise<number>;
    filteredCount(filter: Partial<RoleSchema>): Promise<number>;
    filteredCountInUse(filter: Partial<RoleSchema>): Promise<number>;
    create(role: ICustomRoleInsert): Promise<ICustomRole>;
    delete(id: number): Promise<void>;
    get(id: number): Promise<ICustomRole>;
    update(role: ICustomRoleUpdate): Promise<ICustomRole>;
    exists(id: number): Promise<boolean>;
    nameInUse(name: string, existingId?: number): Promise<boolean>;
    deleteAll(): Promise<void>;
    mapRow(row: IRoleRow): ICustomRole;
    getRoles(): Promise<IRole[]>;
    getRoleWithId(id: number): Promise<IRole>;
    getProjectRoles(): Promise<IRole[]>;
    getRolesForProject(projectId: string): Promise<IRole[]>;
    getRootRoles(): Promise<IRole[]>;
    removeRolesForProject(projectId: string): Promise<void>;
    getRootRoleForAllUsers(): Promise<IUserRole[]>;
    getRoleByName(name: string): Promise<IRole>;
    destroy(): void;
}
export {};
//# sourceMappingURL=role-store.d.ts.map