import type { StrategyEvaluationResult } from '../client';
import type { Constraint } from '../constraint';
import type { Context } from '../context';
import { type SegmentForEvaluation, Strategy } from './strategy';
export default class UnknownStrategy extends Strategy {
    constructor();
    isEnabled(): boolean;
    isEnabledWithConstraints(parameters: unknown, context: Context, constraints: Iterable<Constraint>, segments: SegmentForEvaluation[]): StrategyEvaluationResult;
}
//# sourceMappingURL=unknown-strategy.d.ts.map