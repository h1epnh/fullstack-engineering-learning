"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strategy_1 = require("./strategy");
class UserWithIdStrategy extends strategy_1.Strategy {
    constructor() {
        super('userWithId');
    }
    isEnabled(parameters, context) {
        const userIdList = parameters.userIds
            ? parameters.userIds.split(/\s*,\s*/)
            : [];
        return (context.userId !== undefined && userIdList.includes(context.userId));
    }
}
exports.default = UserWithIdStrategy;
//# sourceMappingURL=user-with-id-strategy.js.map