import type { Strategy } from './strategy';
import type { FeatureInterface } from './feature';
import type { RepositoryInterface } from './repository';
import { type Variant, type VariantDefinition } from './variant';
import type { Context } from './context';
import type { SegmentForEvaluation } from './strategy/strategy';
import type { PlaygroundStrategySchema } from '../../../openapi/spec/playground-strategy-schema';
import { playgroundStrategyEvaluation } from '../../../openapi/spec/playground-strategy-schema';
export type EvaluatedPlaygroundStrategy = Omit<PlaygroundStrategySchema, 'links'>;
export type StrategyEvaluationResult = Pick<EvaluatedPlaygroundStrategy, 'result' | 'segments' | 'constraints'>;
export type FeatureStrategiesEvaluationResult = {
    result: boolean | typeof playgroundStrategyEvaluation.unknownResult;
    variant?: Variant;
    variants?: VariantDefinition[];
    strategies: EvaluatedPlaygroundStrategy[];
    hasUnsatisfiedDependency?: boolean;
};
export default class UnleashClient {
    private repository;
    private strategies;
    constructor(repository: RepositoryInterface, strategies: Strategy[]);
    private getStrategy;
    isParentDependencySatisfied(feature: FeatureInterface | undefined, context: Context): boolean;
    isEnabled(name: string, context: Context, fallback: Function): FeatureStrategiesEvaluationResult;
    isFeatureEnabled(feature: FeatureInterface, context: Context, fallback: Function): FeatureStrategiesEvaluationResult;
    getSegment(repo: RepositoryInterface): (segmentId: number) => SegmentForEvaluation | undefined;
    getVariant(name: string, context: Context, fallbackVariant?: Variant): Variant;
    forceGetVariant(name: string, context: Context, forcedResult: Pick<FeatureStrategiesEvaluationResult, 'result' | 'variant'>, fallbackVariant?: Variant): Variant;
    private resolveVariant;
}
//# sourceMappingURL=client.d.ts.map