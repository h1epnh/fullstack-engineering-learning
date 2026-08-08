import type { IFeaturesReadModel } from '../types/features-read-model-type';
export declare class FakeFeaturesReadModel implements IFeaturesReadModel {
    featureExists(): Promise<boolean>;
    featuresInTheSameProject(featureA: string, featureB: string): Promise<boolean>;
}
//# sourceMappingURL=fake-features-read-model.d.ts.map