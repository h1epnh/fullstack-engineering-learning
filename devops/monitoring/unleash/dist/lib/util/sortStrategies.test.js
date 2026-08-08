"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sortStrategies_1 = require("./sortStrategies");
describe('sortStrategies', () => {
    it('should prioritize strategies with milestoneId over those without', () => {
        const strategies = [
            { sortOrder: 2 },
            { milestoneId: 'm1', sortOrder: 1 },
            { sortOrder: 1 },
            { milestoneId: 'm2', sortOrder: 2 },
        ];
        const sorted = strategies.sort(sortStrategies_1.sortStrategies);
        expect(sorted).toEqual([
            { milestoneId: 'm1', sortOrder: 1 },
            { milestoneId: 'm2', sortOrder: 2 },
            { sortOrder: 1 },
            { sortOrder: 2 },
        ]);
    });
    it('should sort by sortOrder when both have milestoneId', () => {
        const strategies = [
            { milestoneId: 'm1', sortOrder: 2 },
            { milestoneId: 'm2', sortOrder: 1 },
        ];
        const sorted = strategies.sort(sortStrategies_1.sortStrategies);
        expect(sorted).toEqual([
            { milestoneId: 'm2', sortOrder: 1 },
            { milestoneId: 'm1', sortOrder: 2 },
        ]);
    });
    it('should sort by sortOrder when neither has milestoneId', () => {
        const strategies = [
            { sortOrder: 3 },
            { sortOrder: 1 },
            { sortOrder: 2 },
        ];
        const sorted = strategies.sort(sortStrategies_1.sortStrategies);
        expect(sorted).toEqual([
            { sortOrder: 1 },
            { sortOrder: 2 },
            { sortOrder: 3 },
        ]);
    });
    it('should return 0 if both milestoneId and sortOrder are equal', () => {
        const strategy1 = { milestoneId: 'm1', sortOrder: 1 };
        const strategy2 = { milestoneId: 'm1', sortOrder: 1 };
        const result = (0, sortStrategies_1.sortStrategies)(strategy1, strategy2);
        expect(result).toBe(0);
    });
    it('should handle cases where sortOrder is not a number', () => {
        const strategies = [{ sortOrder: undefined }, { sortOrder: 1 }];
        const sorted = strategies.sort(sortStrategies_1.sortStrategies);
        expect(sorted).toEqual([{ sortOrder: undefined }, { sortOrder: 1 }]);
    });
});
//# sourceMappingURL=sortStrategies.test.js.map