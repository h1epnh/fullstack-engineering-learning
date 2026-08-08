import type { Context } from './context';
import type { FeatureInterface } from './feature';
interface Override {
    contextName: string;
    values: string[];
}
export interface Payload {
    type: 'string' | 'csv' | 'json' | 'number';
    value: string;
}
export interface VariantDefinition {
    name: string;
    weight: number;
    stickiness?: string;
    payload?: Payload;
    overrides?: Override[];
}
export interface Variant {
    name: string;
    enabled: boolean;
    payload?: Payload;
    featureEnabled?: boolean;
    /**
     * @deprecated use featureEnabled
     */
    feature_enabled?: boolean;
}
export declare function getDefaultVariant(): Variant;
export declare function selectVariantDefinition(featureName: string, variants: VariantDefinition[], context: Context): VariantDefinition | null;
export declare function selectVariant(feature: FeatureInterface, context: Context): VariantDefinition | null;
export {};
//# sourceMappingURL=variant.d.ts.map