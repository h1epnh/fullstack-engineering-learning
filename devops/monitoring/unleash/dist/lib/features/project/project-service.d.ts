import type { IAuditUser, IUser } from '../../types/user';
import type { AccessService, AccessWithRoles } from '../../services/access-service';
import { type CreateProject, type FeatureToggle, type IProject, type IProjectApplications, type IProjectHealth, type IProjectOverview, type IProjectRoleUsage, type IProjectUpdate, type IUnleashConfig, type IUnleashStores, type ProjectCreated } from '../../types';
import type { IProjectAccessModel, IRoleDescriptor } from '../../types/stores/access-store';
import type FeatureToggleService from '../feature-toggle/feature-toggle-service';
import type { GroupService } from '../../services/group-service';
import type { IGroupRole } from '../../types/group';
import type { FavoritesService } from '../../services/favorites-service';
import type { ProjectDoraMetricsSchema } from '../../openapi';
import type { IPrivateProjectChecker } from '../private-project/privateProjectCheckerType';
import type EventService from '../events/event-service';
import type { IProjectApplicationsSearchParams, IProjectEnterpriseSettingsUpdate, IProjectQuery, IProjectsQuery } from './project-store-type';
import type { ApiTokenService } from '../../services/api-token-service';
import type { ProjectForUi } from './project-read-model-type';
type Days = number;
type Count = number;
export interface IProjectStats {
    avgTimeToProdCurrentWindow: Days;
    createdCurrentWindow: Count;
    createdPastWindow: Count;
    archivedCurrentWindow: Count;
    archivedPastWindow: Count;
    projectActivityCurrentWindow: Count;
    projectActivityPastWindow: Count;
    projectMembersAddedCurrentWindow: Count;
}
interface ICalculateStatus {
    projectId: string;
    updates: IProjectStats;
}
export default class ProjectService {
    private projectStore;
    private projectOwnersReadModel;
    private projectFlagCreatorsReadModel;
    private accessService;
    private eventStore;
    private featureToggleStore;
    private featureEnvironmentStore;
    private environmentStore;
    private groupService;
    private logger;
    private featureToggleService;
    private privateProjectChecker;
    private accountStore;
    private apiTokenService;
    private favoritesService;
    private eventService;
    private projectStatsStore;
    private flagResolver;
    private isEnterprise;
    private resourceLimits;
    private eventBus;
    private projectReadModel;
    private onboardingReadModel;
    constructor({ projectStore, projectOwnersReadModel, projectFlagCreatorsReadModel, eventStore, featureToggleStore, environmentStore, featureEnvironmentStore, accountStore, projectStatsStore, projectReadModel, onboardingReadModel, }: Pick<IUnleashStores, 'projectStore' | 'projectOwnersReadModel' | 'projectFlagCreatorsReadModel' | 'eventStore' | 'featureToggleStore' | 'environmentStore' | 'featureEnvironmentStore' | 'accountStore' | 'projectStatsStore' | 'projectReadModel' | 'onboardingReadModel'>, config: IUnleashConfig, accessService: AccessService, featureToggleService: FeatureToggleService, groupService: GroupService, favoriteService: FavoritesService, eventService: EventService, privateProjectChecker: IPrivateProjectChecker, apiTokenService: ApiTokenService);
    getProjects(query?: IProjectQuery & IProjectsQuery, userId?: number): Promise<ProjectForUi[]>;
    addOwnersToProjects(projects: ProjectForUi[]): Promise<ProjectForUi[]>;
    getProject(id: string): Promise<IProject>;
    private validateAndProcessFeatureNamingPattern;
    private validateEnvironmentsExist;
    validateProjectEnvironments(environments: string[] | undefined): Promise<void>;
    validateProjectLimit(): Promise<void>;
    generateProjectId(name: string): Promise<string>;
    createProject(newProject: CreateProject, user: IUser, auditUser: IAuditUser, enableChangeRequestsForSpecifiedEnvironments?: (environments: CreateProject['changeRequestEnvironments']) => Promise<ProjectCreated['changeRequestEnvironments']>): Promise<ProjectCreated>;
    updateProject(updatedProject: IProjectUpdate, auditUser: IAuditUser): Promise<void>;
    updateProjectEnterpriseSettings(updatedProject: IProjectEnterpriseSettingsUpdate, auditUser: IAuditUser): Promise<void>;
    checkProjectsCompatibility(feature: FeatureToggle, newProjectId: string): Promise<boolean>;
    addEnvironmentToProject(project: string, environment: string): Promise<void>;
    private validateActiveProject;
    changeProject(newProjectId: string, featureName: string, user: IUser, currentProjectId: string, auditUser: IAuditUser): Promise<any>;
    deleteProject(id: string, user: IUser, auditUser: IAuditUser): Promise<void>;
    archiveProject(id: string, auditUser: IAuditUser): Promise<void>;
    reviveProject(id: string, auditUser: IAuditUser): Promise<void>;
    validateId(id: string): Promise<boolean>;
    validateUniqueId(id: string): Promise<void>;
    getAccessToProject(projectId: string): Promise<AccessWithRoles>;
    /**
     * @deprecated use removeUserAccess
     */
    removeUser(projectId: string, roleId: number, userId: number, auditUser: IAuditUser): Promise<void>;
    removeUserAccess(projectId: string, userId: number, auditUser: IAuditUser): Promise<void>;
    removeGroupAccess(projectId: string, groupId: number, auditUser: IAuditUser): Promise<void>;
    addGroup(projectId: string, roleId: number, groupId: number, auditUser: IAuditUser): Promise<void>;
    /**
     * @deprecated use removeGroupAccess
     */
    removeGroup(projectId: string, roleId: number, groupId: number, auditUser: IAuditUser): Promise<void>;
    addRoleAccess(projectId: string, roleId: number, usersAndGroups: IProjectAccessModel, auditUser: IAuditUser): Promise<void>;
    private isAdmin;
    private isProjectOwner;
    private isAllowedToAddAccess;
    addAccess(projectId: string, roles: number[], groups: number[], users: number[], auditUser: IAuditUser): Promise<void>;
    setRolesForUser(projectId: string, userId: number, newRoles: number[], auditUser: IAuditUser): Promise<void>;
    setRolesForGroup(projectId: string, groupId: number, newRoles: number[], auditUser: IAuditUser): Promise<void>;
    findProjectGroupRole(projectId: string, roleId: number): Promise<IGroupRole>;
    findProjectRole(projectId: string, roleId: number): Promise<IRoleDescriptor>;
    /** @deprecated use projectInsightsService instead */
    getDoraMetrics(projectId: string): Promise<ProjectDoraMetricsSchema>;
    getApplications(searchParams: IProjectApplicationsSearchParams): Promise<IProjectApplications>;
    getProjectFlagCreators(projectId: string): Promise<{
        id: number;
        name: string;
    }[]>;
    changeRole(projectId: string, roleId: number, userId: number, auditUser: IAuditUser): Promise<void>;
    changeGroupRole(projectId: string, roleId: number, userId: number, auditUser: IAuditUser): Promise<void>;
    getMembers(projectId: string): Promise<number>;
    getProjectUsers(projectId: string): Promise<Array<Pick<IUser, 'id' | 'email' | 'username'>>>;
    isProjectUser(userId: number, projectId: string): Promise<boolean>;
    getProjectsByUser(userId: number): Promise<string[]>;
    getProjectRoleUsage(roleId: number): Promise<IProjectRoleUsage[]>;
    statusJob(): Promise<void>;
    getStatusUpdates(projectId: string): Promise<ICalculateStatus>;
    getProjectHealth(projectId: string, archived?: boolean, userId?: number): Promise<IProjectHealth>;
    getProjectOverview(projectId: string, archived?: boolean, userId?: number): Promise<IProjectOverview>;
    removePropertiesForNonEnterprise(data: any): any;
}
export {};
//# sourceMappingURL=project-service.d.ts.map