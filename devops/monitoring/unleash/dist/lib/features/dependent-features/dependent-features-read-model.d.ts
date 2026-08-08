import type { Db } from '../../db/db';
import type { IDependentFeaturesReadModel } from './dependent-features-read-model-type';
import type { IDependency, IFeatureDependency } from '../../types';
export declare class DependentFeaturesReadModel implements IDependentFeaturesReadModel {
    private db;
    constructor(db: Db);
    getOrphanParents(parentsAndChildren: string[]): Promise<string[]>;
    getChildren(parents: string[]): Promise<string[]>;
    getParents(child: string): Promise<IDependency[]>;
    getDependencies(children: string[]): Promise<IFeatureDependency[]>;
    getPossibleParentFeatures(child: string): Promise<string[]>;
    getPossibleParentVariants(parent: string): Promise<string[]>;
    haveDependencies(features: string[]): Promise<boolean>;
    hasAnyDependencies(): Promise<boolean>;
}
//# sourceMappingURL=dependent-features-read-model.d.ts.map