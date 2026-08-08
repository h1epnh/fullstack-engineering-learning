"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Strategy = void 0;
const constraint_1 = require("../constraint");
const variant_1 = require("../variant");
class Strategy {
    constructor(name, returnValue = false) {
        this.name = name || 'unknown';
        this.returnValue = returnValue;
    }
    checkConstraint(constraint, context) {
        const evaluator = constraint_1.operators.get(constraint.operator);
        if (!evaluator) {
            return false;
        }
        if (constraint.inverted) {
            return !evaluator(constraint, context);
        }
        return evaluator(constraint, context);
    }
    checkConstraints(context, constraints) {
        if (!constraints) {
            return {
                result: true,
                constraints: [],
            };
        }
        const mappedConstraints = [];
        for (const constraint of constraints) {
            if (constraint) {
                mappedConstraints.push({
                    ...constraint,
                    value: constraint?.value?.toString() ?? undefined,
                    result: this.checkConstraint(constraint, context),
                });
            }
        }
        const result = mappedConstraints.every((constraint) => constraint.result);
        return {
            result,
            constraints: mappedConstraints,
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isEnabled(parameters, context) {
        return this.returnValue;
    }
    checkSegments(context, segments) {
        const resolvedSegments = segments.map((segment) => {
            const { result, constraints } = this.checkConstraints(context, segment.constraints);
            return {
                name: segment.name,
                id: segment.id,
                result,
                constraints,
            };
        });
        return {
            result: resolvedSegments.every((segment) => segment.result),
            segments: resolvedSegments,
        };
    }
    isEnabledWithConstraints(parameters, context, constraints, segments, disabled, variantDefinitions) {
        const constraintResults = this.checkConstraints(context, constraints);
        const enabledResult = this.isEnabled(parameters, context);
        const segmentResults = this.checkSegments(context, segments);
        const overallResult = constraintResults.result && enabledResult && segmentResults.result;
        const variantDefinition = variantDefinitions
            ? (0, variant_1.selectVariantDefinition)(parameters.groupId, variantDefinitions, context)
            : undefined;
        const variant = variantDefinition
            ? {
                name: variantDefinition.name,
                enabled: true,
                payload: variantDefinition.payload,
            }
            : undefined;
        if (disabled) {
            return {
                result: {
                    enabled: 'unknown',
                    evaluationStatus: 'unevaluated',
                },
                constraints: constraintResults.constraints,
                segments: segmentResults.segments,
            };
        }
        return {
            result: {
                enabled: overallResult,
                evaluationStatus: 'complete',
                variant,
                variants: variant ? variantDefinitions : undefined,
            },
            constraints: constraintResults.constraints,
            segments: segmentResults.segments,
        };
    }
}
exports.Strategy = Strategy;
//# sourceMappingURL=strategy.js.map