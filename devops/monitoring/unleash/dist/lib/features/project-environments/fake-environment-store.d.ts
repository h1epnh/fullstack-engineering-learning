import type { IEnvironment, IProjectsAvailableOnEnvironment } from '../../types/model';
import type { IEnvironmentStore } from './environment-store-type';
export default class FakeEnvironmentStore implements IEnvironmentStore {
    importEnvironments(envs: IEnvironment[]): Promise<IEnvironment[]>;
    environments: IEnvironment[];
    disable(environments: IEnvironment[]): Promise<void>;
    enable(environments: IEnvironment[]): Promise<void>;
    count(): Promise<number>;
    getAll(): Promise<IEnvironment[]>;
    exists(name: string): Promise<boolean>;
    getByName(name: string): Promise<IEnvironment>;
    create(env: IEnvironment): Promise<IEnvironment>;
    update(env: Pick<IEnvironment, 'type' | 'protected' | 'requiredApprovals'>, name: string): Promise<IEnvironment>;
    updateSortOrder(id: string, value: number): Promise<void>;
    updateProperty(id: string, field: string, value: string | number): Promise<void>;
    toggle(name: string, enabled: boolean): Promise<void>;
    connectProject(environment: string, projectId: string): Promise<void>;
    connectFeatures(environment: string, projectId: string): Promise<void>;
    delete(name: string): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
    get(key: string): Promise<IEnvironment | undefined>;
    getAllWithCounts(): Promise<IEnvironment[]>;
    getProjectEnvironments(projectId: string): Promise<IProjectsAvailableOnEnvironment[]>;
    getMaxSortOrder(): Promise<number>;
}
//# sourceMappingURL=fake-environment-store.d.ts.map