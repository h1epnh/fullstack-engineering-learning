"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFeatureFlagNamesAgainstPattern = exports.checkFeatureNamingData = void 0;
const compileRegex = (pattern) => new RegExp(`^${pattern}$`);
const disallowedStrings = [' ', '\\t', '\\s', '\\n', '\\r', '\\f', '\\v'];
// Helper functions for error messages
const whitespaceError = (pattern) => `Feature flag names cannot contain whitespace. You've provided a feature flag naming pattern that contains a whitespace character: "${pattern}". Remove any whitespace characters from your pattern.`;
const exampleMismatchError = (example, pattern) => `You've provided a feature flag naming example ("${example}") that doesn't match your feature flag naming pattern ("${pattern}").`;
const invalidValueError = (valueName) => `You've provided a feature flag naming ${valueName}, but no feature flag naming pattern. You must specify a pattern to use a ${valueName}.`;
const checkFeatureNamingData = (featureNaming) => {
    const { pattern, example, description } = featureNaming;
    const errors = [];
    if (disallowedStrings.some((str) => pattern?.includes(str))) {
        errors.push(whitespaceError(pattern));
    }
    else if (pattern && example && !compileRegex(pattern).test(example)) {
        errors.push(exampleMismatchError(example, pattern));
    }
    if (!pattern && example) {
        errors.push(invalidValueError('example'));
    }
    if (!pattern && description) {
        errors.push(invalidValueError('description'));
    }
    const [first, ...rest] = errors;
    if (first) {
        return { state: 'invalid', reasons: [first, ...rest] };
    }
    return { state: 'valid' };
};
exports.checkFeatureNamingData = checkFeatureNamingData;
const checkFeatureFlagNamesAgainstPattern = (featureNames, pattern) => {
    if (pattern) {
        const regex = compileRegex(pattern);
        const mismatchedNames = featureNames.filter((name) => !regex.test(name));
        if (mismatchedNames.length > 0) {
            return {
                state: 'invalid',
                invalidNames: new Set(mismatchedNames),
            };
        }
    }
    return { state: 'valid' };
};
exports.checkFeatureFlagNamesAgainstPattern = checkFeatureFlagNamesAgainstPattern;
//# sourceMappingURL=feature-naming-validation.js.map