import type { AdvancedPlaygroundRequestSchema, AdvancedPlaygroundResponseSchema, PlaygroundRequestSchema, PlaygroundResponseSchema } from '../../openapi';
import type { AdvancedPlaygroundFeatureEvaluationResult, PlaygroundFeatureEvaluationResult } from './playground-service';
export declare const advancedPlaygroundViewModel: (input: AdvancedPlaygroundRequestSchema, playgroundResult: AdvancedPlaygroundFeatureEvaluationResult[], invalidContextProperties?: string[]) => AdvancedPlaygroundResponseSchema;
export declare const playgroundViewModel: (input: PlaygroundRequestSchema, playgroundResult: PlaygroundFeatureEvaluationResult[]) => PlaygroundResponseSchema;
//# sourceMappingURL=playground-view-model.d.ts.map