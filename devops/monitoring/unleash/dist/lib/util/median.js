"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.median = void 0;
const median = (numbers) => {
    numbers.sort((a, b) => a - b);
    const midIndex = Math.floor(numbers.length / 2);
    if (numbers.length % 2 === 0) {
        return (numbers[midIndex - 1] + numbers[midIndex]) / 2;
    }
    else {
        return numbers[midIndex];
    }
};
exports.median = median;
//# sourceMappingURL=median.js.map