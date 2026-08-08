"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientFeaturesAndSegments = exports.clientFeatures = exports.clientFeature = exports.variants = exports.variant = exports.strategies = exports.segment = exports.strategy = exports.strategyConstraint = exports.commonISOTimestamp = exports.urlFriendlyString = void 0;
const fast_check_1 = __importDefault(require("fast-check"));
const constants_1 = require("../lib/util/constants");
const model_1 = require("../lib/types/model");
const urlFriendlyString = () => fast_check_1.default
    .array(fast_check_1.default.oneof(fast_check_1.default
    .integer({ min: 0x30, max: 0x39 })
    .map(String.fromCharCode), // numbers
fast_check_1.default
    .integer({ min: 0x41, max: 0x5a })
    .map(String.fromCharCode), // UPPERCASE LETTERS
fast_check_1.default
    .integer({ min: 0x61, max: 0x7a })
    .map(String.fromCharCode), // lowercase letters
fast_check_1.default.constantFrom('-', '_', '~', '.'), // rest
fast_check_1.default.lorem({ maxCount: 1 })), { minLength: 1 })
    .map((arr) => arr.join(''))
    // filter out strings that are only dots because they mess with url parsing
    .filter((string) => ![...string].every((char) => char === '.'));
exports.urlFriendlyString = urlFriendlyString;
const commonISOTimestamp = () => fast_check_1.default
    .date({
    min: new Date('1900-01-01T00:00:00.000Z'),
    max: new Date('9999-12-31T23:59:59.999Z'),
})
    .map((timestamp) => timestamp.toISOString());
exports.commonISOTimestamp = commonISOTimestamp;
const strategyConstraint = () => fast_check_1.default.record({
    contextName: (0, exports.urlFriendlyString)(),
    operator: fast_check_1.default.constantFrom(...constants_1.ALL_OPERATORS),
    caseInsensitive: fast_check_1.default.boolean(),
    inverted: fast_check_1.default.boolean(),
    values: fast_check_1.default.array(fast_check_1.default.string(), { minLength: 1 }),
    value: fast_check_1.default.string(),
});
exports.strategyConstraint = strategyConstraint;
const strategyConstraints = () => fast_check_1.default.array((0, exports.strategyConstraint)());
const strategy = (name, parameters) => parameters
    ? fast_check_1.default.record({
        name: fast_check_1.default.constant(name),
        id: fast_check_1.default.uuid(),
        parameters,
        segments: fast_check_1.default.uniqueArray(fast_check_1.default.integer({ min: 1 })),
        constraints: strategyConstraints(),
    }, { requiredKeys: ['name', 'parameters', 'id'] })
    : fast_check_1.default.record({
        id: fast_check_1.default.uuid(),
        name: fast_check_1.default.constant(name),
        segments: fast_check_1.default.uniqueArray(fast_check_1.default.integer({ min: 1 })),
        constraints: strategyConstraints(),
    }, { requiredKeys: ['name', 'id'] });
exports.strategy = strategy;
const segment = () => fast_check_1.default.record({
    id: fast_check_1.default.integer({ min: 1 }),
    name: (0, exports.urlFriendlyString)(),
    constraints: strategyConstraints(),
});
exports.segment = segment;
const strategies = () => fast_check_1.default.uniqueArray(fast_check_1.default.oneof((0, exports.strategy)('default'), (0, exports.strategy)('flexibleRollout', fast_check_1.default.record({
    groupId: fast_check_1.default.lorem({ maxCount: 1 }),
    rollout: fast_check_1.default.nat({ max: 100 }).map(String),
    stickiness: fast_check_1.default.constantFrom('default', 'userId', 'sessionId'),
})), (0, exports.strategy)('applicationHostname', fast_check_1.default.record({
    hostNames: fast_check_1.default
        .uniqueArray(fast_check_1.default.domain())
        .map((domains) => domains.join(',')),
})), (0, exports.strategy)('userWithId', fast_check_1.default.record({
    userIds: fast_check_1.default
        .uniqueArray(fast_check_1.default.emailAddress())
        .map((ids) => ids.join(',')),
})), (0, exports.strategy)('remoteAddress', fast_check_1.default.record({
    IPs: fast_check_1.default.uniqueArray(fast_check_1.default.ipV4()).map((ips) => ips.join(',')),
})), (0, exports.strategy)('custom-strategy', fast_check_1.default.record({
    customParam: fast_check_1.default
        .uniqueArray(fast_check_1.default.lorem())
        .map((words) => words.join(',')),
}))), { selector: (generatedStrategy) => generatedStrategy.id });
exports.strategies = strategies;
const variant = () => fast_check_1.default.record({
    name: (0, exports.urlFriendlyString)(),
    weight: fast_check_1.default.nat({ max: 1000 }),
    weightType: fast_check_1.default.constant(model_1.WeightType.VARIABLE),
    stickiness: fast_check_1.default.constant('default'),
    payload: fast_check_1.default.option(fast_check_1.default.oneof(fast_check_1.default.record({
        type: fast_check_1.default.constant('json'),
        value: fast_check_1.default.json(),
    }), fast_check_1.default.record({
        type: fast_check_1.default.constant('csv'),
        value: fast_check_1.default
            .array(fast_check_1.default.lorem())
            .map((words) => words.join(',')),
    }), fast_check_1.default.record({
        type: fast_check_1.default.constant('string'),
        value: fast_check_1.default.string(),
    })), { nil: undefined }),
}, { requiredKeys: ['name', 'weight', 'weightType', 'stickiness'] });
exports.variant = variant;
const variants = () => fast_check_1.default
    .uniqueArray((0, exports.variant)(), {
    maxLength: 1000,
    selector: (variantInstance) => variantInstance.name,
})
    .map((allVariants) => allVariants.map((variantInstance) => ({
    ...variantInstance,
    weight: Math.round(1000 / allVariants.length),
})));
exports.variants = variants;
const clientFeature = (name) => fast_check_1.default.record({
    name: name ? fast_check_1.default.constant(name) : (0, exports.urlFriendlyString)(),
    type: fast_check_1.default.constantFrom('release', 'kill-switch', 'experiment', 'operational', 'permission'),
    description: fast_check_1.default.lorem(),
    project: (0, exports.urlFriendlyString)(),
    enabled: fast_check_1.default.boolean(),
    createdAt: (0, exports.commonISOTimestamp)(),
    lastSeenAt: (0, exports.commonISOTimestamp)(),
    stale: fast_check_1.default.boolean(),
    impressionData: fast_check_1.default.option(fast_check_1.default.boolean(), { nil: undefined }),
    strategies: (0, exports.strategies)(),
    variants: (0, exports.variants)(),
}, { requiredKeys: ['name', 'enabled', 'project', 'strategies'] });
exports.clientFeature = clientFeature;
const clientFeatures = (constraints) => fast_check_1.default.uniqueArray((0, exports.clientFeature)(), {
    ...constraints,
    selector: (v) => v.name,
});
exports.clientFeatures = clientFeatures;
const clientFeaturesAndSegments = (featureConstraints) => {
    const segments = () => fast_check_1.default.uniqueArray((0, exports.segment)(), {
        selector: (generatedSegment) => generatedSegment.id,
    });
    // create segments and make sure that all strategies reference segments that
    // exist
    return fast_check_1.default
        .tuple(segments(), (0, exports.clientFeatures)(featureConstraints))
        .map(([generatedSegments, generatedFeatures]) => {
        const renumberedSegments = generatedSegments.map((generatedSegment, index) => ({
            ...generatedSegment,
            id: index + 1,
        }));
        const features = generatedFeatures.map((feature) => ({
            ...feature,
            ...(feature.strategies && {
                strategies: feature.strategies.map((generatedStrategy) => ({
                    ...generatedStrategy,
                    ...(generatedStrategy.segments && {
                        segments: renumberedSegments.length > 0
                            ? [
                                ...new Set(generatedStrategy.segments.map((generatedSegment) => (generatedSegment %
                                    renumberedSegments.length) +
                                    1)),
                            ]
                            : [],
                    }),
                })),
            }),
        }));
        return {
            features,
            segments: renumberedSegments,
        };
    });
};
exports.clientFeaturesAndSegments = clientFeaturesAndSegments;
// TEST ARBITRARIES
test('url-friendly strings are URL-friendly', () => fast_check_1.default.assert(fast_check_1.default.property((0, exports.urlFriendlyString)(), (input) => /^[\w~.-]+$/.test(input))));
test('variant payloads are either present or undefined; never null', () => fast_check_1.default.assert(fast_check_1.default.property((0, exports.variant)(), (generatedVariant) => !!generatedVariant.payload ||
    generatedVariant.payload === undefined)));
//# sourceMappingURL=arbitraries.test.js.map