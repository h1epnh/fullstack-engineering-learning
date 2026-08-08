import type { ITag } from '../../lib/types/model';
import type { IFeatureAndTag, IFeatureTag, IFeatureTagStore } from '../../lib/types/stores/feature-tag-store';
export default class FakeFeatureTagStore implements IFeatureTagStore {
    private featureTags;
    getAllTagsForFeature(featureName: string): Promise<ITag[]>;
    getAllFeaturesForTag(tagValue: string): Promise<string[]>;
    delete(key: IFeatureTag): Promise<void>;
    destroy(): void;
    exists(key: IFeatureTag): Promise<boolean>;
    get(key: IFeatureTag): Promise<IFeatureTag | undefined>;
    getAll(): Promise<IFeatureTag[]>;
    tagFeature(featureName: string, tag: ITag, createdByUserId: number): Promise<ITag>;
    getAllFeatureTags(): Promise<IFeatureTag[]>;
    deleteAll(): Promise<void>;
    tagFeatures(featureTags: IFeatureTag[]): Promise<IFeatureAndTag[]>;
    untagFeature(featureName: string, tag: ITag): Promise<void>;
    getAllByFeatures(features: string[]): Promise<IFeatureTag[]>;
    untagFeatures(featureTags: IFeatureTag[]): Promise<void>;
}
//# sourceMappingURL=fake-feature-tag-store.d.ts.map