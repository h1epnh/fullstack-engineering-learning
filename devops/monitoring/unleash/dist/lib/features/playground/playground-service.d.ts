import type { SdkContextSchema } from '../../openapi/spec/sdk-context-schema';
import type { IUnleashServices } from '../../types/services';
import { ALL } from '../../types/models/api-token';
import type { PlaygroundFeatureSchema } from '../../openapi/spec/playground-feature-schema';
import type { ISegmentReadModel, IUnleashConfig } from '../../types';
import type { EvaluatedPlaygroundStrategy } from '../../features/playground/feature-evaluator/client';
import type { AdvancedPlaygroundFeatureSchema, playgroundStrategyEvaluation } from '../../openapi';
import type { AdvancedPlaygroundEnvironmentFeatureSchema } from '../../openapi/spec/advanced-playground-environment-feature-schema';
export type AdvancedPlaygroundEnvironmentFeatureEvaluationResult = Omit<AdvancedPlaygroundEnvironmentFeatureSchema, 'strategies'> & {
    strategies: {
        result: boolean | typeof playgroundStrategyEvaluation.unknownResult;
        data: EvaluatedPlaygroundStrategy[];
    };
};
export type AdvancedPlaygroundFeatureEvaluationResult = Omit<AdvancedPlaygroundFeatureSchema, 'environments'> & {
    environments: Record<string, AdvancedPlaygroundEnvironmentFeatureEvaluationResult[]>;
};
export type PlaygroundFeatureEvaluationResult = Omit<PlaygroundFeatureSchema, 'strategies'> & {
    strategies: {
        result: boolean | typeof playgroundStrategyEvaluation.unknownResult;
        data: EvaluatedPlaygroundStrategy[];
    };
};
export declare class PlaygroundService {
    private readonly logger;
    private readonly featureToggleService;
    private readonly flagResolver;
    private readonly privateProjectChecker;
    private readonly segmentReadModel;
    constructor(config: IUnleashConfig, { featureToggleService, privateProjectChecker, }: Pick<IUnleashServices, 'featureToggleService' | 'privateProjectChecker'>, segmentReadModel: ISegmentReadModel);
    evaluateAdvancedQuery(projects: typeof ALL | string[], environments: string[], context: SdkContextSchema, userId: number): Promise<{
        result: AdvancedPlaygroundFeatureEvaluationResult[];
        invalidContextProperties: string[];
    }>;
    private evaluate;
    private resolveFeatures;
    evaluateQuery(projects: typeof ALL | string[], environment: string, context: SdkContextSchema): Promise<PlaygroundFeatureEvaluationResult[]>;
}
//# sourceMappingURL=playground-service.d.ts.map