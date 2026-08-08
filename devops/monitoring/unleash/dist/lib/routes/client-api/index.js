"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("../controller"));
const client_feature_toggle_controller_1 = __importDefault(require("../../features/client-feature-toggles/client-feature-toggle.controller"));
const metrics_1 = __importDefault(require("../../features/metrics/instance/metrics"));
const register_1 = __importDefault(require("../../features/metrics/instance/register"));
class ClientApi extends controller_1.default {
    constructor(config, services) {
        super(config);
        this.use('/features', new client_feature_toggle_controller_1.default(services, config).router);
        this.use('/metrics', new metrics_1.default(services, config).router);
        this.use('/register', new register_1.default(services, config).router);
    }
}
exports.default = ClientApi;
module.exports = ClientApi;
//# sourceMappingURL=index.js.map