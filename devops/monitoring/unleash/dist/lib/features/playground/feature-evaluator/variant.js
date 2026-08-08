"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultVariant = getDefaultVariant;
exports.selectVariantDefinition = selectVariantDefinition;
exports.selectVariant = selectVariant;
const util_1 = require("./strategy/util");
const helpers_1 = require("./helpers");
function getDefaultVariant() {
    return {
        name: 'disabled',
        enabled: false,
    };
}
function randomString() {
    return String(Math.round(Math.random() * 100000));
}
const stickinessSelectors = ['userId', 'sessionId', 'remoteAddress'];
function getSeed(context, stickiness = 'default') {
    if (stickiness !== 'default') {
        const value = (0, helpers_1.resolveContextValue)(context, stickiness);
        return value ? value.toString() : randomString();
    }
    let result;
    stickinessSelectors.some((key) => {
        const value = context[key];
        if (typeof value === 'string' && value !== '') {
            result = value;
            return true;
        }
        return false;
    });
    return result || randomString();
}
function overrideMatchesContext(context) {
    return (o) => o.values.some((value) => value === (0, helpers_1.resolveContextValue)(context, o.contextName));
}
function findOverride(variants, context) {
    return variants
        .filter((variant) => variant.overrides)
        .find((variant) => variant.overrides?.some(overrideMatchesContext(context)));
}
function selectVariantDefinition(featureName, variants, context) {
    const totalWeight = variants.reduce((acc, v) => acc + v.weight, 0);
    if (totalWeight <= 0) {
        return null;
    }
    const variantOverride = findOverride(variants, context);
    if (variantOverride) {
        return variantOverride;
    }
    const { stickiness } = variants[0];
    const target = (0, util_1.normalizedVariantValue)(getSeed(context, stickiness), featureName, totalWeight);
    let counter = 0;
    const variant = variants.find((v) => {
        if (v.weight === 0) {
            return undefined;
        }
        counter += v.weight;
        if (counter < target) {
            return undefined;
        }
        return v;
    });
    return variant || null;
}
function selectVariant(feature, context) {
    return selectVariantDefinition(feature.name, feature.variants, context);
}
//# sourceMappingURL=variant.js.map