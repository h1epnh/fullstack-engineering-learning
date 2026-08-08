import type { IEnvironment, IProject, IProjectApplications, IProjectUpdate, IUnleashConfig, ProjectMode } from '../../types';
import type { IProjectHealthUpdate, IProjectInsert, IProjectQuery, IProjectSettings, IProjectEnterpriseSettingsUpdate, IProjectStore, ProjectEnvironment, IProjectApplicationsSearchParams } from '../../features/project/project-store-type';
import type EventEmitter from 'events';
import type { Db } from '../../db/db';
import type { CreateFeatureStrategySchema } from '../../openapi';
export interface IEnvironmentProjectLink {
    environmentName: string;
    projectId: string;
}
export interface ProjectModeCount {
    mode: ProjectMode;
    count: number;
}
export interface IProjectMembersCount {
    count: number;
    project: string;
}
declare class ProjectStore implements IProjectStore {
    private db;
    private logger;
    private flagResolver;
    private timer;
    private isOss;
    constructor(db: Db, eventBus: EventEmitter, { getLogger, flagResolver, isOss, }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver' | 'isOss'>);
    fieldToRow(data: any): Omit<IProjectInsert, 'mode'>;
    destroy(): void;
    isFeatureLimitReached(id: string): Promise<boolean>;
    getAll(query?: IProjectQuery): Promise<IProject[]>;
    get(id: string): Promise<IProject>;
    exists(id: string): Promise<boolean>;
    hasProject(id: string): Promise<boolean>;
    hasActiveProject(id: string): Promise<boolean>;
    updateHealth(healthUpdate: IProjectHealthUpdate): Promise<void>;
    create(project: IProjectInsert & IProjectSettings): Promise<IProject>;
    private hasProjectSettings;
    update(data: IProjectUpdate): Promise<void>;
    updateProjectEnterpriseSettings(data: IProjectEnterpriseSettingsUpdate): Promise<void>;
    importProjects(projects: IProjectInsert[], environments?: IEnvironment[]): Promise<IProject[]>;
    addDefaultEnvironment(projects: any[]): Promise<void>;
    deleteAll(): Promise<void>;
    delete(id: string): Promise<void>;
    archive(id: string): Promise<void>;
    revive(id: string): Promise<void>;
    getProjectLinksForEnvironments(environments: string[]): Promise<IEnvironmentProjectLink[]>;
    deleteEnvironmentForProject(id: string, environment: string): Promise<void>;
    addEnvironmentToProject(id: string, environment: string): Promise<void>;
    addEnvironmentToProjects(environment: string, projects: string[]): Promise<void>;
    getEnvironmentsForProject(id: string): Promise<ProjectEnvironment[]>;
    getMembersCountByProject(projectId: string): Promise<number>;
    getMembersCountByProjectAfterDate(projectId: string, date: string): Promise<number>;
    getApplicationsByProject(params: IProjectApplicationsSearchParams): Promise<IProjectApplications>;
    getDefaultStrategy(projectId: string, environment: string): Promise<CreateFeatureStrategySchema | null>;
    updateDefaultStrategy(projectId: string, environment: string, strategy: CreateFeatureStrategySchema): Promise<CreateFeatureStrategySchema>;
    count(): Promise<number>;
    getProjectModeCounts(): Promise<ProjectModeCount[]>;
    private mapProjectModeCount;
    private mapLinkRow;
    private mapRow;
    private mapProjectEnvironmentRow;
    private getAggregatedApplicationsData;
}
export default ProjectStore;
//# sourceMappingURL=project-store.d.ts.map