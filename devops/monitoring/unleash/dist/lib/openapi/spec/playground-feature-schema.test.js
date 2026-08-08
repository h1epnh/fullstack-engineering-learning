"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = void 0;
const fast_check_1 = __importDefault(require("fast-check"));
const arbitraries_test_1 = require("../../../test/arbitraries.test");
const validate_1 = require("../validate");
const playground_feature_schema_1 = require("./playground-feature-schema");
const playground_strategy_schema_1 = require("./playground-strategy-schema");
const playgroundStrategyConstraint = () => fast_check_1.default
    .tuple(fast_check_1.default.boolean(), (0, arbitraries_test_1.strategyConstraint)())
    .map(([result, constraint]) => ({
    ...constraint,
    result,
}));
const playgroundStrategyConstraints = () => fast_check_1.default.array(playgroundStrategyConstraint());
const playgroundSegment = () => fast_check_1.default.record({
    name: fast_check_1.default.string({ minLength: 1 }),
    id: fast_check_1.default.nat(),
    result: fast_check_1.default.boolean(),
    constraints: playgroundStrategyConstraints(),
});
const playgroundStrategy = (name, parameters) => fast_check_1.default.record({
    id: fast_check_1.default.uuid(),
    name: fast_check_1.default.constant(name),
    result: fast_check_1.default.oneof(fast_check_1.default.record({
        evaluationStatus: fast_check_1.default.constant(playground_strategy_schema_1.playgroundStrategyEvaluation.evaluationComplete),
        enabled: fast_check_1.default.boolean(),
    }), fast_check_1.default.record({
        evaluationStatus: fast_check_1.default.constant(playground_strategy_schema_1.playgroundStrategyEvaluation.evaluationIncomplete),
        enabled: fast_check_1.default.constantFrom(playground_strategy_schema_1.playgroundStrategyEvaluation.unknownResult, false),
    })),
    parameters,
    constraints: playgroundStrategyConstraints(),
    segments: fast_check_1.default.array(playgroundSegment()),
    disabled: fast_check_1.default.boolean(),
    links: fast_check_1.default.constant({
        edit: '/projects/some-project/features/some-feature/strategies/edit?environmentId=some-env&strategyId=some-strat',
    }),
});
const playgroundStrategies = () => fast_check_1.default.array(fast_check_1.default.oneof(playgroundStrategy('default', fast_check_1.default.constant({})), playgroundStrategy('flexibleRollout', fast_check_1.default.record({
    groupId: fast_check_1.default.lorem({ maxCount: 1 }),
    rollout: fast_check_1.default.nat({ max: 100 }).map(String),
    stickiness: fast_check_1.default.constantFrom('default', 'userId', 'sessionId'),
})), playgroundStrategy('applicationHostname', fast_check_1.default.record({
    hostNames: fast_check_1.default
        .uniqueArray(fast_check_1.default.domain())
        .map((domains) => domains.join(',')),
})), playgroundStrategy('userWithId', fast_check_1.default.record({
    userIds: fast_check_1.default
        .uniqueArray(fast_check_1.default.emailAddress())
        .map((ids) => ids.join(',')),
})), playgroundStrategy('remoteAddress', fast_check_1.default.record({
    IPs: fast_check_1.default.uniqueArray(fast_check_1.default.ipV4()).map((ips) => ips.join(',')),
}))));
const generate = () => fast_check_1.default
    .tuple((0, arbitraries_test_1.variants)(), fast_check_1.default.nat(), fast_check_1.default.record({
    isEnabledInCurrentEnvironment: fast_check_1.default.boolean(),
    projectId: (0, arbitraries_test_1.urlFriendlyString)(),
    name: (0, arbitraries_test_1.urlFriendlyString)(),
    strategies: playgroundStrategies(),
}))
    .map(([generatedVariants, activeVariantIndex, feature]) => {
    const strategyResult = () => {
        const { strategies } = feature;
        if (strategies.some((strategy) => strategy.result.enabled === true)) {
            return true;
        }
        if (strategies.some((strategy) => strategy.result.enabled === 'unknown')) {
            return 'unknown';
        }
        return false;
    };
    const isEnabled = feature.isEnabledInCurrentEnvironment &&
        strategyResult() === true;
    // the active variant is the disabled variant if the feature is
    // disabled or has no variants.
    let activeVariant = { name: 'disabled', enabled: false };
    if (generatedVariants.length && isEnabled) {
        const targetVariant = generatedVariants[activeVariantIndex % generatedVariants.length];
        const targetPayload = targetVariant.payload
            ? targetVariant.payload
            : undefined;
        activeVariant = {
            enabled: true,
            name: targetVariant.name,
            payload: targetPayload,
        };
    }
    return {
        ...feature,
        isEnabled,
        strategies: {
            result: strategyResult(),
            data: feature.strategies,
        },
        variants: generatedVariants,
        variant: activeVariant,
    };
});
exports.generate = generate;
test('playgroundFeatureSchema', () => fast_check_1.default.assert(fast_check_1.default.property((0, exports.generate)(), fast_check_1.default.context(), (data, ctx) => {
    const results = (0, validate_1.validateSchema)(playground_feature_schema_1.playgroundFeatureSchema.$id, data);
    ctx.log(JSON.stringify(results));
    return results === undefined;
})));
//# sourceMappingURL=playground-feature-schema.test.js.map