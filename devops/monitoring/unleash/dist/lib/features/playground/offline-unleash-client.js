"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offlineUnleashClient = exports.mapSegmentsForClient = exports.mapFeatureForClient = exports.mapFeaturesForClient = void 0;
const feature_evaluator_1 = require("./feature-evaluator");
const serialize_dates_1 = require("../../types/serialize-dates");
const mapFeaturesForClient = (features) => features.map((feature) => (0, exports.mapFeatureForClient)(feature));
exports.mapFeaturesForClient = mapFeaturesForClient;
const mapFeatureForClient = (feature) => {
    return {
        impressionData: false,
        ...feature,
        variants: (feature.variants || []).map((variant) => ({
            overrides: [],
            ...variant,
            payload: variant.payload && {
                ...variant.payload,
                type: variant.payload.type,
            },
        })),
        project: feature.project,
        strategies: feature.strategies.map((strategy) => ({
            parameters: {},
            ...strategy,
            title: strategy.title ?? undefined,
            disabled: strategy.disabled ?? false,
            variants: (strategy.variants || []).map((variant) => ({
                ...variant,
                payload: variant.payload && {
                    ...variant.payload,
                    type: variant.payload.type,
                },
            })),
            constraints: strategy.constraints?.map((constraint) => ({
                inverted: false,
                values: [],
                ...constraint,
                operator: constraint.operator,
            })) || [],
        })),
        dependencies: feature.dependencies,
    };
};
exports.mapFeatureForClient = mapFeatureForClient;
const mapSegmentsForClient = (segments) => (0, serialize_dates_1.serializeDates)(segments);
exports.mapSegmentsForClient = mapSegmentsForClient;
const offlineUnleashClient = async ({ features, context, segments, }) => {
    const client = new feature_evaluator_1.FeatureEvaluator({
        ...context,
        appName: context.appName,
        storageProvider: new feature_evaluator_1.InMemStorageProvider(),
        bootstrap: {
            // FIXME: mismatch between playground and proxy types
            data: (0, exports.mapFeaturesForClient)(features),
            segments: (0, exports.mapSegmentsForClient)(segments || []),
        },
    });
    await client.start();
    return client;
};
exports.offlineUnleashClient = offlineUnleashClient;
//# sourceMappingURL=offline-unleash-client.js.map