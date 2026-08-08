import type { ICreateGroupModel, IGroup, IGroupModel, IGroupProject, IGroupRole } from '../types/group';
import { type IAuditUser, type IUnleashConfig, type IUnleashStores } from '../types';
import type EventService from '../features/events/event-service';
import type { IGroupWithProjectRoles } from '../types/stores/access-store';
export declare class GroupService {
    private groupStore;
    private eventService;
    private accountStore;
    private logger;
    constructor(stores: Pick<IUnleashStores, 'groupStore' | 'accountStore'>, { getLogger }: Pick<IUnleashConfig, 'getLogger'>, eventService: EventService);
    getAll(): Promise<IGroupModel[]>;
    getAllWithId(ids: number[]): Promise<IGroup[]>;
    mapGroupWithProjects(groupProjects: IGroupProject[], group: IGroupModel): IGroupModel;
    getGroup(id: number): Promise<IGroupModel>;
    isScimGroup(id: number): Promise<boolean>;
    createGroup(group: ICreateGroupModel, auditUser: IAuditUser): Promise<IGroup>;
    updateGroup(group: IGroupModel, auditUser: IAuditUser): Promise<IGroup>;
    getProjectGroups(projectId: string): Promise<IGroupWithProjectRoles[]>;
    deleteGroup(id: number, auditUser: IAuditUser): Promise<void>;
    validateGroup(group: IGroupModel | ICreateGroupModel, existingGroup?: IGroup): Promise<void>;
    getRolesForProject(projectId: string): Promise<IGroupRole[]>;
    syncExternalGroups(userId: number, externalGroups: string[], createdBy?: string, // deprecated
    createdByUserId?: number): Promise<void>;
    deleteScimGroups(auditUser: IAuditUser): Promise<void>;
    private mapGroupWithUsers;
    getGroupsForUser(userId: number): Promise<IGroup[]>;
}
//# sourceMappingURL=group-service.d.ts.map