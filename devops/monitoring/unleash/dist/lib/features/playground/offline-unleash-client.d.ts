import type { SdkContextSchema } from '../../openapi/spec/sdk-context-schema';
import { FeatureEvaluator } from './feature-evaluator';
import type { FeatureConfigurationClient } from '../../features/feature-toggle/types/feature-toggle-strategies-store-type';
import type { Segment } from './feature-evaluator/strategy/strategy';
import type { ISegment } from '../../types/model';
import type { FeatureInterface } from 'unleash-client/lib/feature';
type NonEmptyList<T> = [T, ...T[]];
export declare const mapFeaturesForClient: (features: FeatureConfigurationClient[]) => FeatureInterface[];
export declare const mapFeatureForClient: (feature: FeatureConfigurationClient) => FeatureInterface;
export declare const mapSegmentsForClient: (segments: ISegment[]) => Segment[];
export type ClientInitOptions = {
    features: NonEmptyList<FeatureConfigurationClient>;
    segments?: ISegment[];
    context: SdkContextSchema;
    logError: (message: any, ...args: any[]) => void;
};
export declare const offlineUnleashClient: ({ features, context, segments, }: ClientInitOptions) => Promise<FeatureEvaluator>;
export {};
//# sourceMappingURL=offline-unleash-client.d.ts.map