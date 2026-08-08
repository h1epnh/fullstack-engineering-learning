import type { IDependency, IFeatureDependency } from '../../types';
export interface IDependentFeaturesReadModel {
    getChildren(parents: string[]): Promise<string[]>;
    getOrphanParents(parentsAndChildren: string[]): Promise<string[]>;
    getParents(child: string): Promise<IDependency[]>;
    getDependencies(children: string[]): Promise<IFeatureDependency[]>;
    getPossibleParentFeatures(child: string): Promise<string[]>;
    getPossibleParentVariants(parent: string): Promise<string[]>;
    haveDependencies(features: string[]): Promise<boolean>;
    hasAnyDependencies(): Promise<boolean>;
}
//# sourceMappingURL=dependent-features-read-model-type.d.ts.map