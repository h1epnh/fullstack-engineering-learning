import type { FeatureStrategySchema, ImportTogglesValidateItemSchema } from '../../openapi';
import type { IContextFieldDto } from '../context/context-field-store-type';
import type { FeatureNameCheckResultWithFeaturePattern } from '../feature-toggle/feature-toggle-service';
import type { ProjectFeaturesLimit } from './import-toggles-store-type';
export interface IErrorsParams {
    projectName: string;
    strategies: FeatureStrategySchema[];
    contextFields: IContextFieldDto[];
    otherProjectFeatures: string[];
    duplicateFeatures: string[];
    featureNameCheckResult: FeatureNameCheckResultWithFeaturePattern;
    featureLimitResult: ProjectFeaturesLimit;
    segments: string[];
    dependencies: string[];
}
export interface IWarningParams {
    usedCustomStrategies: string[];
    archivedFeatures: string[];
    existingFeatures: string[];
}
export declare class ImportValidationMessages {
    static compilePermissionErrors(missingPermissions: string[]): ImportTogglesValidateItemSchema[];
    static compileErrors({ projectName, strategies, contextFields, otherProjectFeatures, duplicateFeatures, featureNameCheckResult, featureLimitResult, segments, dependencies, }: IErrorsParams): ImportTogglesValidateItemSchema[];
    static compileWarnings({ usedCustomStrategies, existingFeatures, archivedFeatures, }: IWarningParams): ImportTogglesValidateItemSchema[];
}
//# sourceMappingURL=import-validation-messages.d.ts.map