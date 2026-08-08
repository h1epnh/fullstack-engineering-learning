"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortStrategies = void 0;
const sortStrategies = (strategy1, strategy2) => {
    if (strategy1.milestoneId && !strategy2.milestoneId) {
        return -1;
    }
    if (!strategy1.milestoneId && strategy2.milestoneId) {
        return 1;
    }
    if (typeof strategy1.sortOrder === 'number' &&
        typeof strategy2.sortOrder === 'number') {
        return strategy1.sortOrder - strategy2.sortOrder;
    }
    return 0;
};
exports.sortStrategies = sortStrategies;
//# sourceMappingURL=sortStrategies.js.map