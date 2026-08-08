import type { IFeatureToggleStore, IProject, IProjectHealthReport } from '../../types';
import type { IFeatureType, IFeatureTypeStore } from '../../types/stores/feature-type-store';
type IPartialFeatures = Array<{
    stale?: boolean;
    createdAt?: Date;
    type?: string;
}>;
export declare const calculateProjectHealth: (features: IPartialFeatures, featureTypes: IFeatureType[]) => Pick<IProjectHealthReport, "staleCount" | "potentiallyStaleCount" | "activeCount">;
export declare const calculateHealthRating: (features: IPartialFeatures, featureTypes: IFeatureType[]) => number;
export declare const calculateProjectHealthRating: (featureTypeStore: IFeatureTypeStore, featureToggleStore: IFeatureToggleStore) => ({ id }: Pick<IProject, "id">) => Promise<number>;
export {};
//# sourceMappingURL=project-health.d.ts.map