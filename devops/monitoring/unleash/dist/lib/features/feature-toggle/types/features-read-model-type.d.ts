export interface IFeaturesReadModel {
    featureExists(parent: string): Promise<boolean>;
    featuresInTheSameProject(featureA: string, featureB: string): Promise<boolean>;
}
//# sourceMappingURL=features-read-model-type.d.ts.map