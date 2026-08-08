"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strategy_1 = require("./strategy");
const util_1 = require("./util");
const helpers_1 = require("../helpers");
const STICKINESS = {
    default: 'default',
    random: 'random',
};
class FlexibleRolloutStrategy extends strategy_1.Strategy {
    constructor(radnomGenerator) {
        super('flexibleRollout');
        this.randomGenerator = () => `${Math.round(Math.random() * 10000) + 1}`;
        if (radnomGenerator) {
            this.randomGenerator = radnomGenerator;
        }
    }
    resolveStickiness(stickiness, context) {
        switch (stickiness) {
            case STICKINESS.default:
                return (context.userId ||
                    context.sessionId ||
                    this.randomGenerator());
            case STICKINESS.random:
                return this.randomGenerator();
            default:
                return (0, helpers_1.resolveContextValue)(context, stickiness);
        }
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    isEnabled(parameters, context) {
        const groupId = parameters.groupId ||
            (context.featureToggle && String(context.featureToggle)) ||
            '';
        const percentage = Number(parameters.rollout);
        const stickiness = parameters.stickiness || STICKINESS.default;
        const stickinessId = this.resolveStickiness(stickiness, context);
        if (!stickinessId) {
            return false;
        }
        const normalizedUserId = (0, util_1.normalizedStrategyValue)(stickinessId, groupId);
        return percentage > 0 && normalizedUserId <= percentage;
    }
}
exports.default = FlexibleRolloutStrategy;
//# sourceMappingURL=flexible-rollout-strategy.js.map