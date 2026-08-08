import type EventEmitter from 'events';
import type { LogProvider } from '../../logger';
import type { FeatureToggleWithEnvironment, IFeatureOverview, IFeatureStrategiesStore, IFeatureStrategy, IFlagResolver, PartialSome } from '../../types';
import type { IFeatureProjectUserParams } from './feature-toggle-controller';
import type { Db } from '../../db/db';
export interface ILoadFeatureToggleWithEnvsParams {
    featureName: string;
    archived: boolean;
    withEnvironmentVariants: boolean;
    userId?: number;
}
declare class FeatureStrategiesStore implements IFeatureStrategiesStore {
    private db;
    private logger;
    private readonly timer;
    private flagResolver;
    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider, flagResolver: IFlagResolver);
    delete(key: string): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
    exists(key: string): Promise<boolean>;
    get(key: string): Promise<IFeatureStrategy>;
    private nextSortOrder;
    private getDefaultStickiness;
    createStrategyFeatureEnv(strategyConfig: PartialSome<IFeatureStrategy, 'id' | 'createdAt'>): Promise<IFeatureStrategy>;
    removeAllStrategiesForFeatureEnv(featureName: string, environment: string): Promise<void>;
    getAll(): Promise<IFeatureStrategy[]>;
    getAllByFeatures(features: string[], environment?: string): Promise<IFeatureStrategy[]>;
    getStrategiesForFeatureEnv(projectId: string, featureName: string, environment: string): Promise<IFeatureStrategy[]>;
    getFeatureToggleWithEnvs(featureName: string, userId?: number, archived?: boolean): Promise<FeatureToggleWithEnvironment>;
    getFeatureToggleWithVariantEnvs(featureName: string, userId?: number, archived?: boolean): Promise<FeatureToggleWithEnvironment>;
    loadFeatureToggleWithEnvs({ featureName, archived, withEnvironmentVariants, userId, }: ILoadFeatureToggleWithEnvsParams): Promise<FeatureToggleWithEnvironment>;
    private addSegmentIdsToStrategy;
    private static getEnvironment;
    private addTag;
    private isNewTag;
    private static rowToTag;
    getFeatureOverview({ projectId, archived, userId, tag, namePrefix, }: IFeatureProjectUserParams): Promise<IFeatureOverview[]>;
    getAggregatedSearchData(rows: any): IFeatureOverview;
    getFeatureOverviewData(rows: any): Record<string, IFeatureOverview>;
    getStrategyById(id: string): Promise<IFeatureStrategy>;
    updateSortOrder(id: string, sortOrder: number): Promise<void>;
    updateStrategy(id: string, updates: Partial<IFeatureStrategy>): Promise<IFeatureStrategy>;
    private static getAdminStrategy;
    deleteConfigurationsForProjectAndEnvironment(projectId: String, environment: String): Promise<void>;
    setProjectForStrategiesBelongingToFeature(featureName: string, newProjectId: string): Promise<void>;
    getStrategiesBySegment(segmentId: number): Promise<IFeatureStrategy[]>;
    getStrategiesByContextField(contextFieldName: string): Promise<IFeatureStrategy[]>;
    prefixColumns(): string[];
    getCustomStrategiesInUseCount(): Promise<number>;
}
export default FeatureStrategiesStore;
//# sourceMappingURL=feature-toggle-strategies-store.d.ts.map