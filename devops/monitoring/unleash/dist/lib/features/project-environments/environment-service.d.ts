import { type IAuditUser, type IEnvironment, type IProjectsAvailableOnEnvironment, type ISortOrder, type IUnleashConfig, type IUnleashStores } from '../../types';
import type { CreateFeatureStrategySchema } from '../../openapi';
import type EventService from '../events/event-service';
export default class EnvironmentService {
    private logger;
    private environmentStore;
    private featureStrategiesStore;
    private projectStore;
    private featureEnvironmentStore;
    private eventService;
    private flagResolver;
    constructor({ environmentStore, featureStrategiesStore, featureEnvironmentStore, projectStore, }: Pick<IUnleashStores, 'environmentStore' | 'featureStrategiesStore' | 'featureEnvironmentStore' | 'projectStore'>, { getLogger, flagResolver, }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>, eventService: EventService);
    getAll(): Promise<IEnvironment[]>;
    get(name: string): Promise<IEnvironment>;
    getProjectEnvironments(projectId: string): Promise<IProjectsAvailableOnEnvironment[]>;
    updateSortOrder(sortOrder: ISortOrder): Promise<void>;
    toggleEnvironment(name: string, value: boolean): Promise<void>;
    addEnvironmentToProject(environment: string, projectId: string, auditUser: IAuditUser): Promise<void>;
    updateDefaultStrategy(environment: string, projectId: string, strategy: CreateFeatureStrategySchema, auditUser: IAuditUser): Promise<CreateFeatureStrategySchema>;
    overrideEnabledProjects(environmentNamesToEnable: string[]): Promise<void>;
    private remapProjectsLinks;
    forceRemoveEnvironmentFromProject(environment: string, projectId: string): Promise<void>;
    removeEnvironmentFromProject(environment: string, projectId: string, auditUser: IAuditUser): Promise<void>;
}
//# sourceMappingURL=environment-service.d.ts.map