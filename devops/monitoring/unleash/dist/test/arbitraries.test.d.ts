import { type Arbitrary } from 'fast-check';
import type { ClientFeatureSchema } from '../lib/openapi/spec/client-feature-schema';
import { type IVariant } from '../lib/types/model';
import type { FeatureStrategySchema } from '../lib/openapi/spec/feature-strategy-schema';
import type { ConstraintSchema } from '../lib/openapi/spec/constraint-schema';
import type { SegmentSchema } from '../lib/openapi/spec/segment-schema';
export declare const urlFriendlyString: () => Arbitrary<string>;
export declare const commonISOTimestamp: () => Arbitrary<string>;
export declare const strategyConstraint: () => Arbitrary<ConstraintSchema>;
export declare const strategy: (name: string, parameters?: Arbitrary<Record<string, string>>) => Arbitrary<FeatureStrategySchema>;
export declare const segment: () => Arbitrary<SegmentSchema>;
export declare const strategies: () => Arbitrary<FeatureStrategySchema[]>;
export declare const variant: () => Arbitrary<IVariant>;
export declare const variants: () => Arbitrary<IVariant[]>;
export declare const clientFeature: (name?: string) => Arbitrary<ClientFeatureSchema>;
export declare const clientFeatures: (constraints?: {
    minLength?: number;
}) => Arbitrary<ClientFeatureSchema[]>;
export declare const clientFeaturesAndSegments: (featureConstraints?: {
    minLength?: number;
}) => Arbitrary<{
    features: ClientFeatureSchema[];
    segments: SegmentSchema[];
}>;
//# sourceMappingURL=arbitraries.test.d.ts.map