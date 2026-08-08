import type { Db } from '../../db/db';
import type { IFeaturesReadModel } from './types/features-read-model-type';
export declare class FeaturesReadModel implements IFeaturesReadModel {
    private db;
    constructor(db: Db);
    featureExists(parent: string): Promise<boolean>;
    featuresInTheSameProject(featureA: string, featureB: string): Promise<boolean>;
}
//# sourceMappingURL=features-read-model.d.ts.map