import type { Knex } from 'knex';
import type EventEmitter from 'events';
import type { LogProvider } from '../../logger';
import type { FeatureToggle, FeatureToggleDTO, IFeatureToggleQuery, IVariant } from '../../types/model';
import type { IFeatureToggleStore } from './types/feature-toggle-store-type';
import type { Db } from '../../db/db';
import type { LastSeenInput } from '../metrics/last-seen/last-seen-service';
import type { FeatureConfigurationClient } from './types/feature-toggle-strategies-store-type';
import { type IFeatureTypeCount, type IFlagResolver } from '../../../lib/types';
import type { IFeatureProjectUserParams } from './feature-toggle-controller';
export type EnvironmentFeatureNames = {
    [key: string]: string[];
};
export interface FeaturesTable {
    name: string;
    description: string | null;
    type?: string;
    stale?: boolean | null;
    project: string;
    last_seen_at?: Date;
    created_at?: Date;
    impression_data?: boolean | null;
    archived?: boolean;
    archived_at?: Date | null;
    created_by_user_id?: number;
}
export interface FeatureToggleInsert extends Omit<FeatureToggleDTO, 'createdByUserId'> {
    createdByUserId: number;
}
interface VariantDTO {
    variants: IVariant[];
}
export default class FeatureToggleStore implements IFeatureToggleStore {
    private db;
    private logger;
    private timer;
    private featureToggleRowConverter;
    private flagResolver;
    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider, flagResolver: IFlagResolver);
    count(query?: {
        archived?: boolean;
        project?: string;
        stale?: boolean;
    }): Promise<number>;
    deleteAll(): Promise<void>;
    destroy(): void;
    get(name: string): Promise<FeatureToggle>;
    private getBaseFeatureQuery;
    getFeatureToggleList(featureQuery?: IFeatureToggleQuery, userId?: number, archived?: boolean, includeDisabledStrategies?: boolean): Promise<FeatureToggle[]>;
    getPlaygroundFeatures(featureQuery: IFeatureToggleQuery): Promise<FeatureConfigurationClient[]>;
    getAll(query?: {
        archived?: boolean;
        project?: string;
        stale?: boolean;
    }): Promise<FeatureToggle[]>;
    getArchivedFeatures(project?: string): Promise<FeatureToggle[]>;
    getFeatureTypeCounts({ projectId, archived, }: IFeatureProjectUserParams): Promise<IFeatureTypeCount[]>;
    getAllByNames(names: string[]): Promise<FeatureToggle[]>;
    countByDate(queryModifiers: {
        archived?: boolean;
        project?: string;
        date?: string;
        range?: string[];
        dateAccessor: string;
    }): Promise<number>;
    /**
     * Get projectId from feature filtered by name. Used by Rbac middleware
     * @deprecated
     * @param name
     */
    getProjectId(name: string): Promise<string>;
    exists(name: string): Promise<boolean>;
    setLastSeen(data: LastSeenInput[]): Promise<void>;
    private mapMetricDataToEnvBuckets;
    static filterByArchived: Knex.QueryCallbackWithArgs;
    rowToFeature(row: FeaturesTable): FeatureToggle;
    rowToEnvVariants(variantRows: VariantDTO[]): IVariant[];
    insertToRow(project: string, data: FeatureToggleInsert): FeaturesTable;
    dtoToUpdateRow(project: string, data: FeatureToggleDTO): Omit<FeaturesTable, 'created_by_user_id'>;
    create(project: string, data: FeatureToggleInsert): Promise<FeatureToggle>;
    update(project: string, data: FeatureToggleDTO): Promise<FeatureToggle>;
    archive(name: string): Promise<FeatureToggle>;
    batchArchive(names: string[]): Promise<FeatureToggle[]>;
    batchStale(names: string[], stale: boolean): Promise<FeatureToggle[]>;
    delete(name: string): Promise<void>;
    batchDelete(names: string[]): Promise<void>;
    revive(name: string): Promise<FeatureToggle>;
    batchRevive(names: string[]): Promise<FeatureToggle[]>;
    disableAllEnvironmentsForFeatures(names: string[]): Promise<void>;
    getVariants(featureName: string): Promise<IVariant[]>;
    getVariantsForEnv(featureName: string, environment: string): Promise<IVariant[]>;
    saveVariants(project: string, featureName: string, newVariants: IVariant[]): Promise<FeatureToggle>;
    updatePotentiallyStaleFeatures(currentTime?: string): Promise<{
        name: string;
        potentiallyStale: boolean;
        project: string;
    }[]>;
    isPotentiallyStale(featureName: string): Promise<boolean>;
    setCreatedByUserId(batchSize: number): Promise<number | undefined>;
}
export {};
//# sourceMappingURL=feature-toggle-store.d.ts.map