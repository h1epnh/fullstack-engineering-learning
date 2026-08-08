"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strategy_1 = require("./strategy");
class DefaultStrategy extends strategy_1.Strategy {
    constructor() {
        super('default');
    }
    isEnabled() {
        return true;
    }
}
exports.default = DefaultStrategy;
//# sourceMappingURL=default-strategy.js.map