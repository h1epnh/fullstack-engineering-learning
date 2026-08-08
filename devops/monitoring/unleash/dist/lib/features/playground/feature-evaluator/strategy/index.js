"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultStrategies = exports.Strategy = void 0;
const default_strategy_1 = __importDefault(require("./default-strategy"));
const gradual_rollout_random_1 = __importDefault(require("./gradual-rollout-random"));
const gradual_rollout_user_id_1 = __importDefault(require("./gradual-rollout-user-id"));
const gradual_rollout_session_id_1 = __importDefault(require("./gradual-rollout-session-id"));
const user_with_id_strategy_1 = __importDefault(require("./user-with-id-strategy"));
const remote_address_strategy_1 = __importDefault(require("./remote-address-strategy"));
const flexible_rollout_strategy_1 = __importDefault(require("./flexible-rollout-strategy"));
const unknown_strategy_1 = __importDefault(require("./unknown-strategy"));
const application_hostname_strategy_1 = __importDefault(require("./application-hostname-strategy"));
var strategy_1 = require("./strategy");
Object.defineProperty(exports, "Strategy", { enumerable: true, get: function () { return strategy_1.Strategy; } });
exports.defaultStrategies = [
    new default_strategy_1.default(),
    new application_hostname_strategy_1.default(),
    new gradual_rollout_random_1.default(),
    new gradual_rollout_user_id_1.default(),
    new gradual_rollout_session_id_1.default(),
    new user_with_id_strategy_1.default(),
    new remote_address_strategy_1.default(),
    new flexible_rollout_strategy_1.default(),
    new unknown_strategy_1.default(),
];
//# sourceMappingURL=index.js.map