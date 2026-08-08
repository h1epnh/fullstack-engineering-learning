"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const variant_1 = require("./variant");
const playground_strategy_schema_1 = require("../../../openapi/spec/playground-strategy-schema");
const util_1 = require("../../../util");
class UnleashClient {
    constructor(repository, strategies) {
        this.repository = repository;
        this.strategies = strategies || [];
        this.strategies.forEach((strategy) => {
            if (!strategy ||
                !strategy.name ||
                typeof strategy.name !== 'string' ||
                typeof strategy.isEnabled !== 'function') {
                throw new Error('Invalid strategy data / interface');
            }
        });
    }
    getStrategy(name) {
        return this.strategies.find((strategy) => strategy.name === name);
    }
    isParentDependencySatisfied(feature, context) {
        if (!feature?.dependencies?.length) {
            return true;
        }
        return feature.dependencies.every((parent) => {
            const parentToggle = this.repository.getToggle(parent.feature);
            if (!parentToggle) {
                return false;
            }
            if (parentToggle.dependencies?.length) {
                return false;
            }
            if (Boolean(parent.enabled) !== Boolean(parentToggle.enabled)) {
                return false;
            }
            if (parent.enabled !== false) {
                if (parent.variants?.length) {
                    return parent.variants.includes(this.getVariant(parent.feature, context).name);
                }
                return (this.isEnabled(parent.feature, context, () => false)
                    .result === true);
            }
            return !(this.isEnabled(parent.feature, context, () => false).result ===
                true);
        });
    }
    isEnabled(name, context, fallback) {
        const feature = this.repository.getToggle(name);
        const parentDependencySatisfied = this.isParentDependencySatisfied(feature, context);
        const result = this.isFeatureEnabled(feature, context, fallback);
        return {
            ...result,
            hasUnsatisfiedDependency: !parentDependencySatisfied,
        };
    }
    isFeatureEnabled(feature, context, fallback) {
        if (!feature) {
            return fallback();
        }
        if (!Array.isArray(feature.strategies)) {
            return {
                result: false,
                strategies: [],
            };
        }
        if (feature.strategies.length === 0) {
            return {
                result: feature.enabled,
                strategies: [],
            };
        }
        const strategies = feature.strategies.map((strategySelector) => {
            const getStrategy = () => {
                // assume that 'unknown' strategy is always present
                const unknownStrategy = this.getStrategy('unknown');
                // the application hostname strategy relies on external
                // variables to calculate its result. As such, we can't
                // evaluate it in a way that makes sense. So we'll
                // use the 'unknown' strategy instead.
                if (strategySelector.name === 'applicationHostname') {
                    return unknownStrategy;
                }
                return (this.getStrategy(strategySelector.name) ??
                    unknownStrategy);
            };
            const strategy = getStrategy();
            const segments = strategySelector.segments
                ?.map(this.getSegment(this.repository))
                .filter(Boolean) ?? [];
            const evaluationResult = strategy.isEnabledWithConstraints(strategySelector.parameters, context, strategySelector.constraints, segments, strategySelector.disabled, strategySelector.variants);
            return {
                name: strategySelector.name,
                id: strategySelector.id || (0, util_1.randomId)(),
                title: strategySelector.title,
                disabled: strategySelector.disabled || false,
                parameters: strategySelector.parameters,
                ...evaluationResult,
            };
        });
        // Feature evaluation
        const overallStrategyResult = () => {
            // if at least one strategy is enabled, then the feature is enabled
            const enabledStrategy = strategies.find((strategy) => strategy.result.enabled === true);
            if (enabledStrategy &&
                enabledStrategy.result.evaluationStatus === 'complete') {
                return [
                    true,
                    enabledStrategy.result.variants,
                    enabledStrategy.result.variant || undefined,
                ];
            }
            // if at least one strategy is unknown, then the feature _may_ be enabled
            if (strategies.some((strategy) => strategy.result.enabled === 'unknown')) {
                return [
                    playground_strategy_schema_1.playgroundStrategyEvaluation.unknownResult,
                    undefined,
                    undefined,
                ];
            }
            return [false, undefined, undefined];
        };
        const [result, variants, variant] = overallStrategyResult();
        const evalResults = {
            result,
            variant,
            variants,
            strategies,
        };
        return evalResults;
    }
    getSegment(repo) {
        return (segmentId) => {
            const segment = repo.getSegment(segmentId);
            if (!segment) {
                return undefined;
            }
            return {
                name: segment.name,
                id: segmentId,
                constraints: segment.constraints,
            };
        };
    }
    getVariant(name, context, fallbackVariant) {
        return this.resolveVariant(name, context, fallbackVariant);
    }
    // This function is intended to close an issue in the proxy where feature enabled
    // state gets checked twice when resolving a variant with random stickiness and
    // gradual rollout. This is not intended for general use, prefer getVariant instead
    forceGetVariant(name, context, forcedResult, fallbackVariant) {
        return this.resolveVariant(name, context, fallbackVariant, forcedResult);
    }
    resolveVariant(name, context, fallbackVariant, forcedResult) {
        const fallback = {
            feature_enabled: false,
            featureEnabled: false,
            ...(fallbackVariant || (0, variant_1.getDefaultVariant)()),
        };
        const feature = this.repository.getToggle(name);
        if (typeof feature === 'undefined' ||
            !this.isParentDependencySatisfied(feature, context)) {
            return fallback;
        }
        const result = forcedResult ??
            this.isFeatureEnabled(feature, context, () => fallbackVariant ? fallbackVariant.enabled : false);
        const enabled = result.result === true;
        fallback.feature_enabled = fallbackVariant?.feature_enabled ?? enabled;
        fallback.featureEnabled = fallback.feature_enabled;
        const strategyVariant = result.variant;
        if (enabled && strategyVariant) {
            return strategyVariant;
        }
        if (!enabled) {
            return fallback;
        }
        if (!feature.variants ||
            !Array.isArray(feature.variants) ||
            feature.variants.length === 0 ||
            !feature.enabled) {
            return fallback;
        }
        const variant = (0, variant_1.selectVariant)(feature, context);
        if (variant === null) {
            return fallback;
        }
        return {
            name: variant.name,
            payload: variant.payload,
            enabled,
            feature_enabled: true,
            featureEnabled: true,
        };
    }
}
exports.default = UnleashClient;
//# sourceMappingURL=client.js.map