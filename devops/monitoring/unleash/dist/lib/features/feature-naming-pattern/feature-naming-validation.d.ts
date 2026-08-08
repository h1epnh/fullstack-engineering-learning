import type { IFeatureNaming } from '../../types/model';
export declare const checkFeatureNamingData: (featureNaming: IFeatureNaming) => {
    state: "valid";
} | {
    state: "invalid";
    reasons: [string, ...string[]];
};
export type FeatureNameCheckResult = {
    state: 'valid';
} | {
    state: 'invalid';
    invalidNames: Set<string>;
};
export declare const checkFeatureFlagNamesAgainstPattern: (featureNames: string[], pattern: string | null | undefined) => FeatureNameCheckResult;
//# sourceMappingURL=feature-naming-validation.d.ts.map