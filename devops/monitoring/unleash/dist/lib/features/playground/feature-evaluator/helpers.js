"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFallbackFunction = createFallbackFunction;
exports.resolveContextValue = resolveContextValue;
exports.safeName = safeName;
exports.getDefaultStrategy = getDefaultStrategy;
exports.getProjectDefaultStrategy = getProjectDefaultStrategy;
function createFallbackFunction(name, context, fallback) {
    const createEvalResult = (enabled) => ({
        result: enabled,
        strategies: [],
    });
    if (typeof fallback === 'function') {
        return () => createEvalResult(fallback(name, context));
    }
    if (typeof fallback === 'boolean') {
        return () => createEvalResult(fallback);
    }
    return () => createEvalResult(false);
}
function resolveContextValue(context, field) {
    if (context[field]) {
        return context[field];
    }
    if (context.properties?.[field]) {
        return context.properties[field];
    }
    return undefined;
}
function safeName(str = '') {
    return str.replace(/\//g, '_');
}
function getDefaultStrategy(featureName) {
    return {
        name: 'flexibleRollout',
        constraints: [],
        disabled: false,
        parameters: {
            rollout: '100',
            stickiness: 'default',
            groupId: featureName,
        },
    };
}
function resolveGroupId(defaultStrategy, featureName) {
    const groupId = defaultStrategy?.parameters?.groupId !== ''
        ? defaultStrategy.parameters?.groupId
        : featureName;
    return groupId || '';
}
function getProjectDefaultStrategy(defaultStrategy, featureName) {
    return {
        ...defaultStrategy,
        parameters: {
            ...defaultStrategy.parameters,
            groupId: resolveGroupId(defaultStrategy, featureName),
        },
    };
}
//# sourceMappingURL=helpers.js.map