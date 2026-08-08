import type EventEmitter from 'events';
import type { Db } from '../../db/db';
import type { IEnvironment, IEnvironmentCreate, IProjectEnvironment } from '../../types/model';
import type { IEnvironmentStore } from './environment-store-type';
import type { IUnleashConfig } from '../../types';
export default class EnvironmentStore implements IEnvironmentStore {
    private logger;
    private flagResolver;
    private db;
    private isOss;
    private timer;
    constructor(db: Db, eventBus: EventEmitter, { getLogger, isOss, flagResolver, }: Pick<IUnleashConfig, 'getLogger' | 'isOss' | 'flagResolver'>);
    private allColumns;
    importEnvironments(environments: IEnvironment[]): Promise<IEnvironment[]>;
    deleteAll(): Promise<void>;
    count(): Promise<number>;
    getMaxSortOrder(): Promise<number>;
    get(key: string): Promise<IEnvironment>;
    getAll(query?: Object): Promise<IEnvironment[]>;
    getAllWithCounts(query?: Object): Promise<IEnvironment[]>;
    getProjectEnvironments(projectId: string, query?: Object): Promise<IProjectEnvironment[]>;
    exists(name: string): Promise<boolean>;
    getByName(name: string): Promise<IEnvironment>;
    updateProperty(id: string, field: string, value: string | number): Promise<void>;
    updateSortOrder(id: string, value: number): Promise<void>;
    toggle(name: string, enabled: boolean): Promise<void>;
    update(env: Pick<IEnvironment, 'type' | 'protected' | 'requiredApprovals'>, name: string): Promise<IEnvironment>;
    create(env: IEnvironmentCreate): Promise<IEnvironment>;
    disable(environments: IEnvironment[]): Promise<void>;
    enable(environments: IEnvironment[]): Promise<void>;
    delete(name: string): Promise<void>;
    destroy(): void;
}
//# sourceMappingURL=environment-store.d.ts.map