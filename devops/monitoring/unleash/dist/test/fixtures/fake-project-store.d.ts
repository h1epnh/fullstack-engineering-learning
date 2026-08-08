import type { IEnvironment, IProject, IProjectApplications, IProjectStore } from '../../lib/types';
import type { IEnvironmentProjectLink, ProjectModeCount } from '../../lib/features/project/project-store';
import type { CreateFeatureStrategySchema } from '../../lib/openapi';
import type { IProjectApplicationsSearchParams, IProjectHealthUpdate, IProjectInsert, ProjectEnvironment } from '../../lib/features/project/project-store-type';
type ArchivableProject = Omit<IProject, 'archivedAt'> & {
    archivedAt: null | Date;
};
export default class FakeProjectStore implements IProjectStore {
    projects: ArchivableProject[];
    projectEnvironment: Map<string, Set<string>>;
    getEnvironmentsForProject(): Promise<ProjectEnvironment[]>;
    getProjectLinksForEnvironments(environments: string[]): Promise<IEnvironmentProjectLink[]>;
    addEnvironmentToProject(id: string, environment: string): Promise<void>;
    private createInternal;
    create(project: IProjectInsert): Promise<IProject>;
    delete(key: string): Promise<void>;
    deleteAll(): Promise<void>;
    deleteEnvironmentForProject(id: string, environment: string): Promise<void>;
    destroy(): void;
    count(): Promise<number>;
    get(key: string): Promise<IProject>;
    getAll(): Promise<IProject[]>;
    getMembersCountByProject(projectId: string): Promise<number>;
    exists(key: string): Promise<boolean>;
    hasProject(id: string): Promise<boolean>;
    hasActiveProject(id: string): Promise<boolean>;
    importProjects(projects: IProjectInsert[], environments?: IEnvironment[]): Promise<IProject[]>;
    update(update: IProjectInsert): Promise<void>;
    updateHealth(healthUpdate: IProjectHealthUpdate): Promise<void>;
    addEnvironmentToProjects(environment: string, projects: string[]): Promise<void>;
    getMembersCountByProjectAfterDate(projectId: string, date: string): Promise<number>;
    updateDefaultStrategy(projectId: string, environment: string, strategy: CreateFeatureStrategySchema): Promise<CreateFeatureStrategySchema>;
    getDefaultStrategy(projectId: string, environment: string): Promise<CreateFeatureStrategySchema | null>;
    isFeatureLimitReached(id: string): Promise<boolean>;
    getProjectModeCounts(): Promise<ProjectModeCount[]>;
    updateProjectEnterpriseSettings(update: IProjectInsert): Promise<void>;
    getApplicationsByProject(searchParams: IProjectApplicationsSearchParams): Promise<IProjectApplications>;
    archive(id: string): Promise<void>;
    revive(id: string): Promise<void>;
}
export {};
//# sourceMappingURL=fake-project-store.d.ts.map