import type { IFeatureToggleStore, IFeatureToggleStoreQuery } from '../types/feature-toggle-store-type';
import type { FeatureToggle, FeatureToggleDTO, IFeatureEnvironment, IFeatureToggleQuery, IFeatureTypeCount, IVariant } from '../../../types/model';
import type { LastSeenInput } from '../../metrics/last-seen/last-seen-service';
import type { FeatureToggleInsert } from '../feature-toggle-store';
import type { FeatureConfigurationClient } from '../types/feature-toggle-strategies-store-type';
import type { IFeatureProjectUserParams } from '../feature-toggle-controller';
export default class FakeFeatureToggleStore implements IFeatureToggleStore {
    features: FeatureToggle[];
    archive(featureName: string): Promise<FeatureToggle>;
    batchArchive(featureNames: string[]): Promise<FeatureToggle[]>;
    batchStale(featureNames: string[], stale: boolean): Promise<FeatureToggle[]>;
    batchDelete(featureNames: string[]): Promise<void>;
    batchRevive(featureNames: string[]): Promise<FeatureToggle[]>;
    disableAllEnvironmentsForFeatures(names: string[]): Promise<void>;
    count(query?: Partial<IFeatureToggleStoreQuery>): Promise<number>;
    getAllByNames(names: string[]): Promise<FeatureToggle[]>;
    getProjectId(name: string | undefined): Promise<string | undefined>;
    private getFilterQuery;
    create(project: string, data: FeatureToggleInsert): Promise<FeatureToggle>;
    delete(key: string): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
    exists(key: string): Promise<boolean>;
    get(key: string): Promise<FeatureToggle>;
    getAll(query?: Partial<IFeatureToggleStoreQuery>): Promise<FeatureToggle[]>;
    getFeatureMetadata(name: string): Promise<FeatureToggle>;
    getBy(query: Partial<IFeatureToggleStoreQuery>): Promise<FeatureToggle[]>;
    revive(featureName: string): Promise<FeatureToggle>;
    getFeatureToggleList(query?: IFeatureToggleQuery, userId?: number, archived?: boolean): Promise<FeatureToggle[]>;
    getArchivedFeatures(project: string): Promise<FeatureToggle[]>;
    getPlaygroundFeatures(query?: IFeatureToggleQuery): Promise<FeatureConfigurationClient[]>;
    update(project: string, data: FeatureToggleDTO): Promise<FeatureToggle>;
    setLastSeen(data: LastSeenInput[]): Promise<void>;
    getVariants(featureName: string): Promise<IVariant[]>;
    getAllVariants(): Promise<IFeatureEnvironment[]>;
    getVariantsForEnv(featureName: string, environment_name: string): Promise<IVariant[]>;
    saveVariants(project: string, featureName: string, newVariants: IVariant[]): Promise<FeatureToggle>;
    saveVariantsOnEnv(featureName: string, environment: string, newVariants: IVariant[]): Promise<IVariant[]>;
    countByDate(queryModifiers: {
        archived?: boolean;
        project?: string;
        date?: string;
        range?: string[];
        dateAccessor: string;
    }): Promise<number>;
    dropAllVariants(): Promise<void>;
    updatePotentiallyStaleFeatures(): Promise<{
        name: string;
        potentiallyStale: boolean;
        project: string;
    }[]>;
    isPotentiallyStale(): Promise<boolean>;
    getFeatureTypeCounts(params: IFeatureProjectUserParams): Promise<IFeatureTypeCount[]>;
    setCreatedByUserId(batchSize: number): Promise<number | undefined>;
}
//# sourceMappingURL=fake-feature-toggle-store.d.ts.map