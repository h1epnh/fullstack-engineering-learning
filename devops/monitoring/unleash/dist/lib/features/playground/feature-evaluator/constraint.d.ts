import type { Context } from './context';
export interface Constraint {
    contextName: string;
    operator: Operator;
    inverted: boolean;
    values: string[];
    value?: string | number | Date;
    caseInsensitive?: boolean;
}
export declare enum Operator {
    IN = "IN",
    NOT_IN = "NOT_IN",
    STR_ENDS_WITH = "STR_ENDS_WITH",
    STR_STARTS_WITH = "STR_STARTS_WITH",
    STR_CONTAINS = "STR_CONTAINS",
    NUM_EQ = "NUM_EQ",
    NUM_GT = "NUM_GT",
    NUM_GTE = "NUM_GTE",
    NUM_LT = "NUM_LT",
    NUM_LTE = "NUM_LTE",
    DATE_AFTER = "DATE_AFTER",
    DATE_BEFORE = "DATE_BEFORE",
    SEMVER_EQ = "SEMVER_EQ",
    SEMVER_GT = "SEMVER_GT",
    SEMVER_LT = "SEMVER_LT"
}
export type OperatorImpl = (constraint: Constraint, context: Context) => boolean;
export declare const operators: Map<Operator, OperatorImpl>;
//# sourceMappingURL=constraint.d.ts.map