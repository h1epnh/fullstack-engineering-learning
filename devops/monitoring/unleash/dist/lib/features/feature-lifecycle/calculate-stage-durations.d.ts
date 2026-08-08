import type { IProjectLifecycleStageDuration } from '../../types';
import type { FeatureLifecycleProjectItem } from './feature-lifecycle-store-type';
export declare function calculateStageDurations(featureLifeCycles: FeatureLifecycleProjectItem[]): IProjectLifecycleStageDuration[];
export declare const calculateMedians: (groupedByProjectAndStage: {
    [key: string]: number[];
}) => IProjectLifecycleStageDuration[];
//# sourceMappingURL=calculate-stage-durations.d.ts.map