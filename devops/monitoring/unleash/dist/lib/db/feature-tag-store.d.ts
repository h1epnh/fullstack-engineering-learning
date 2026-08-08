import type { LogProvider } from '../logger';
import type { ITag } from '../types';
import type EventEmitter from 'events';
import type { IFeatureAndTag, IFeatureTag, IFeatureTagInsert, IFeatureTagStore } from '../types/stores/feature-tag-store';
import type { Db } from './db';
interface FeatureTagTable {
    feature_name: string;
    tag_type: string;
    tag_value: string;
    created_by_user_id?: number;
}
declare class FeatureTagStore implements IFeatureTagStore {
    private db;
    private logger;
    private readonly timer;
    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider);
    delete({ featureName, tagType, tagValue, }: IFeatureTag): Promise<void>;
    destroy(): void;
    exists({ featureName, tagType, tagValue, }: IFeatureTag): Promise<boolean>;
    get({ featureName, tagType, tagValue, }: IFeatureTag): Promise<IFeatureTag>;
    getAll(): Promise<IFeatureTag[]>;
    getAllTagsForFeature(featureName: string): Promise<ITag[]>;
    getAllFeaturesForTag(tagValue: string): Promise<string[]>;
    featureExists(featureName: string): Promise<boolean>;
    getAllByFeatures(features: string[]): Promise<IFeatureTag[]>;
    tagFeature(featureName: string, tag: ITag, createdByUserId: number): Promise<ITag>;
    untagFeatures(featureTags: IFeatureTag[]): Promise<void>;
    /**
     * Only gets tags for active feature flags.
     */
    getAllFeatureTags(): Promise<IFeatureTag[]>;
    deleteAll(): Promise<void>;
    tagFeatures(featureTags: IFeatureTagInsert[]): Promise<IFeatureAndTag[]>;
    untagFeature(featureName: string, tag: ITag): Promise<void>;
    featureTagRowToTag(row: FeatureTagTable): ITag;
    rowToFeatureAndTag(row: FeatureTagTable): IFeatureAndTag;
    featureTagToRow({ featureName, tagType, tagValue, createdByUserId, }: IFeatureTagInsert): FeatureTagTable;
    featureTagArray({ featureName, tagType, tagValue }: IFeatureTag): string[];
    featureAndTagToRow(featureName: string, { type, value }: ITag, createdByUserId: number): FeatureTagTable;
}
export default FeatureTagStore;
//# sourceMappingURL=feature-tag-store.d.ts.map