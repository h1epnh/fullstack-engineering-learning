import type { IDependentFeaturesReadModel } from './dependent-features-read-model-type';
import type { IDependency, IFeatureDependency } from '../../types';
export declare class FakeDependentFeaturesReadModel implements IDependentFeaturesReadModel {
    getDependencies(): Promise<IFeatureDependency[]>;
    getChildren(): Promise<string[]>;
    getParents(): Promise<IDependency[]>;
    getPossibleParentFeatures(): Promise<string[]>;
    getPossibleParentVariants(): Promise<string[]>;
    haveDependencies(): Promise<boolean>;
    getOrphanParents(parentsAndChildren: string[]): Promise<string[]>;
    hasAnyDependencies(): Promise<boolean>;
}
//# sourceMappingURL=fake-dependent-features-read-model.d.ts.map