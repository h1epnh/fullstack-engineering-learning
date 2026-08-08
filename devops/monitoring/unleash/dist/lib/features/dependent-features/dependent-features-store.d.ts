import type { Db } from '../../db/db';
import type { IDependentFeaturesStore } from './dependent-features-store-type';
import type { FeatureDependency, FeatureDependencyId } from './dependent-features';
export declare class DependentFeaturesStore implements IDependentFeaturesStore {
    private db;
    constructor(db: Db);
    upsert(featureDependency: FeatureDependency): Promise<void>;
    delete(dependency: FeatureDependencyId): Promise<void>;
    deleteAll(features: string[] | undefined): Promise<void>;
}
//# sourceMappingURL=dependent-features-store.d.ts.map