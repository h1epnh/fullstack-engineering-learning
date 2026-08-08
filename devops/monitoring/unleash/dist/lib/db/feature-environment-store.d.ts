import type EventEmitter from 'events';
import type { FeatureEnvironmentKey, IFeatureEnvironmentStore } from '../types/stores/feature-environment-store';
import type { IFeatureEnvironment, IVariant } from '../types/model';
import type { Db } from './db';
import type { IUnleashConfig } from '../types';
export declare class FeatureEnvironmentStore implements IFeatureEnvironmentStore {
    private db;
    private logger;
    private readonly timer;
    private readonly isOss;
    constructor(db: Db, eventBus: EventEmitter, { getLogger, isOss }: Pick<IUnleashConfig, 'getLogger' | 'isOss'>);
    delete({ featureName, environment, }: FeatureEnvironmentKey): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
    exists({ featureName, environment, }: FeatureEnvironmentKey): Promise<boolean>;
    get({ featureName, environment, }: FeatureEnvironmentKey): Promise<IFeatureEnvironment>;
    addOssFilterIfNeeded(queryBuilder: any): any;
    getAll(query?: Object): Promise<IFeatureEnvironment[]>;
    getAllByFeatures(features: string[], environment?: string): Promise<IFeatureEnvironment[]>;
    disableEnvironmentIfNoStrategies(featureName: string, environment: string): Promise<void>;
    addEnvironmentToFeature(featureName: string, environment: string, enabled?: boolean): Promise<void>;
    disconnectFeatures(environment: string, project: string): Promise<void>;
    featureHasEnvironment(environment: string, featureName: string): Promise<boolean>;
    getEnvironmentsForFeature(featureName: string): Promise<IFeatureEnvironment[]>;
    getEnvironmentMetaData(environment: string, featureName: string): Promise<IFeatureEnvironment>;
    isEnvironmentEnabled(featureName: string, environment: string): Promise<boolean>;
    removeEnvironmentForFeature(featureName: string, environment: string): Promise<void>;
    setEnvironmentEnabledStatus(environment: string, featureName: string, enabled: boolean): Promise<number>;
    connectProject(environment: string, projectId: string, idempotent?: boolean): Promise<void>;
    connectFeatures(environment: string, projectId: string): Promise<void>;
    disconnectProject(environment: string, projectId: string): Promise<void>;
    connectFeatureToEnvironmentsForProject(featureName: string, projectId: string, enabledIn?: {
        [environment: string]: boolean;
    }): Promise<void>;
    copyEnvironmentFeaturesByProjects(sourceEnvironment: string, destinationEnvironment: string, projects: string[]): Promise<void>;
    addVariantsToFeatureEnvironment(featureName: string, environment: string, variants: IVariant[]): Promise<void>;
    setVariantsToFeatureEnvironments(featureName: string, environments: string[], variants: IVariant[]): Promise<void>;
    addFeatureEnvironment(featureEnvironment: IFeatureEnvironment): Promise<void>;
    cloneStrategies(sourceEnvironment: string, destinationEnvironment: string): Promise<void>;
    variantExists(featureName: string): Promise<boolean>;
}
//# sourceMappingURL=feature-environment-store.d.ts.map