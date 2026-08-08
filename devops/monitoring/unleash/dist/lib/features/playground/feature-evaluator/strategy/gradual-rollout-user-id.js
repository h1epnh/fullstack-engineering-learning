"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strategy_1 = require("./strategy");
const util_1 = require("./util");
class GradualRolloutUserIdStrategy extends strategy_1.Strategy {
    constructor() {
        super('gradualRolloutUserId');
    }
    isEnabled(parameters, context) {
        const { userId } = context;
        if (!userId) {
            return false;
        }
        const percentage = Number(parameters.percentage);
        const groupId = parameters.groupId || '';
        const normalizedUserId = (0, util_1.normalizedStrategyValue)(userId, groupId);
        return percentage > 0 && normalizedUserId <= percentage;
    }
}
exports.default = GradualRolloutUserIdStrategy;
//# sourceMappingURL=gradual-rollout-user-id.js.map