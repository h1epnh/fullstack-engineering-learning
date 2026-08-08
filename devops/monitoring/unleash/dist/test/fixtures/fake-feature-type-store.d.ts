import type { IFeatureType, IFeatureTypeStore } from '../../lib/types/stores/feature-type-store';
export default class FakeFeatureTypeStore implements IFeatureTypeStore {
    featureTypes: IFeatureType[];
    delete(key: string): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
    exists(key: string): Promise<boolean>;
    get(key: string): Promise<IFeatureType>;
    getAll(): Promise<IFeatureType[]>;
    getByName(name: string): Promise<IFeatureType>;
    updateLifetime(name: string, newLifetimeDays: number | null): Promise<IFeatureType | undefined>;
}
//# sourceMappingURL=fake-feature-type-store.d.ts.map