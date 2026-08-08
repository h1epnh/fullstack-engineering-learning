import type { PlaygroundConstraintSchema } from '../../../../openapi/spec/playground-constraint-schema';
import type { PlaygroundSegmentSchema } from '../../../../openapi/spec/playground-segment-schema';
import type { StrategyEvaluationResult } from '../client';
import { type Constraint } from '../constraint';
import type { Context } from '../context';
import { type VariantDefinition } from '../variant';
export type SegmentForEvaluation = {
    name: string;
    id: number;
    constraints: Constraint[];
};
export interface StrategyTransportInterface {
    name: string;
    title?: string;
    disabled?: boolean;
    parameters: any;
    constraints: Constraint[];
    variants?: VariantDefinition[];
    segments?: number[];
    id?: string;
}
export interface Segment {
    id: number;
    name: string;
    description?: string;
    constraints: Constraint[];
    createdBy: string;
    createdAt: string;
}
export declare class Strategy {
    name: string;
    private returnValue;
    constructor(name: string, returnValue?: boolean);
    checkConstraint(constraint: Constraint, context: Context): boolean;
    checkConstraints(context: Context, constraints?: Iterable<Constraint>): {
        result: boolean;
        constraints: PlaygroundConstraintSchema[];
    };
    isEnabled(parameters: unknown, context: Context): boolean;
    checkSegments(context: Context, segments: SegmentForEvaluation[]): {
        result: boolean;
        segments: PlaygroundSegmentSchema[];
    };
    isEnabledWithConstraints(parameters: Record<string, unknown>, context: Context, constraints: Iterable<Constraint>, segments: Array<SegmentForEvaluation>, disabled?: boolean, variantDefinitions?: VariantDefinition[]): StrategyEvaluationResult;
}
//# sourceMappingURL=strategy.d.ts.map