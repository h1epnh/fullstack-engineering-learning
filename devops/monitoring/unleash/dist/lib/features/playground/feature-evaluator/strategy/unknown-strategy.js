"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const playground_strategy_schema_1 = require("../../../../openapi/spec/playground-strategy-schema");
const strategy_1 = require("./strategy");
class UnknownStrategy extends strategy_1.Strategy {
    constructor() {
        super('unknown');
    }
    isEnabled() {
        return false;
    }
    isEnabledWithConstraints(parameters, context, constraints, segments) {
        const constraintResults = this.checkConstraints(context, constraints);
        const segmentResults = this.checkSegments(context, segments);
        const overallResult = constraintResults.result && segmentResults.result
            ? playground_strategy_schema_1.playgroundStrategyEvaluation.unknownResult
            : false;
        return {
            result: {
                enabled: overallResult,
                evaluationStatus: 'incomplete',
            },
            constraints: constraintResults.constraints,
            segments: segmentResults.segments,
        };
    }
}
exports.default = UnknownStrategy;
//# sourceMappingURL=unknown-strategy.js.map