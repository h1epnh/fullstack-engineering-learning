"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strategy_1 = require("./strategy");
class GradualRolloutRandomStrategy extends strategy_1.Strategy {
    constructor(randomGenerator) {
        super('gradualRolloutRandom');
        this.randomGenerator = () => Math.floor(Math.random() * 100) + 1;
        this.randomGenerator = randomGenerator || this.randomGenerator;
    }
    isEnabled(parameters, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context) {
        const percentage = Number(parameters.percentage);
        const random = this.randomGenerator();
        return percentage >= random;
    }
}
exports.default = GradualRolloutRandomStrategy;
//# sourceMappingURL=gradual-rollout-random.js.map