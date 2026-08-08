"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQueryComplexity = void 0;
const error_1 = require("../../error");
const MAX_COMPLEXITY = 30000;
const validateQueryComplexity = (environmentsCount, featuresCount, contextCombinationsCount, limit = MAX_COMPLEXITY) => {
    const totalCount = environmentsCount * featuresCount * contextCombinationsCount;
    const reason = `Rejecting evaluation as it would generate ${totalCount} combinations exceeding ${limit} limit. `;
    const action = `Please reduce the number of selected environments (${environmentsCount}), features (${featuresCount}), context field combinations (${contextCombinationsCount}).`;
    if (totalCount > limit) {
        throw new error_1.BadDataError(reason + action);
    }
};
exports.validateQueryComplexity = validateQueryComplexity;
//# sourceMappingURL=validateQueryComplexity.js.map