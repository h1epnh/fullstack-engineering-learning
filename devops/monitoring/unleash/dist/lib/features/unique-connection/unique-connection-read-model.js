"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniqueConnectionReadModel = void 0;
const hyperloglog_lite_1 = __importDefault(require("hyperloglog-lite"));
const hyperloglog_config_1 = require("./hyperloglog-config");
class UniqueConnectionReadModel {
    constructor(uniqueConnectionStore) {
        this.uniqueConnectionStore = uniqueConnectionStore;
    }
    async getStats() {
        const [previous, current, previousFrontend, currentFrontend, previousBackend, currentBackend,] = await Promise.all([
            this.uniqueConnectionStore.get('previous'),
            this.uniqueConnectionStore.get('current'),
            this.uniqueConnectionStore.get('previousFrontend'),
            this.uniqueConnectionStore.get('currentFrontend'),
            this.uniqueConnectionStore.get('previousBackend'),
            this.uniqueConnectionStore.get('currentBackend'),
        ]);
        const previousHll = (0, hyperloglog_lite_1.default)(hyperloglog_config_1.REGISTERS_EXPONENT);
        if (previous) {
            previousHll.merge({ n: hyperloglog_config_1.REGISTERS_EXPONENT, buckets: previous.hll });
        }
        const currentHll = (0, hyperloglog_lite_1.default)(hyperloglog_config_1.REGISTERS_EXPONENT);
        if (current) {
            currentHll.merge({ n: hyperloglog_config_1.REGISTERS_EXPONENT, buckets: current.hll });
        }
        const previousFrontendHll = (0, hyperloglog_lite_1.default)(hyperloglog_config_1.REGISTERS_EXPONENT);
        if (previousFrontend) {
            previousFrontendHll.merge({
                n: hyperloglog_config_1.REGISTERS_EXPONENT,
                buckets: previousFrontend.hll,
            });
        }
        const currentFrontendHll = (0, hyperloglog_lite_1.default)(hyperloglog_config_1.REGISTERS_EXPONENT);
        if (currentFrontend) {
            currentFrontendHll.merge({
                n: hyperloglog_config_1.REGISTERS_EXPONENT,
                buckets: currentFrontend.hll,
            });
        }
        const previousBackendHll = (0, hyperloglog_lite_1.default)(hyperloglog_config_1.REGISTERS_EXPONENT);
        if (previousBackend) {
            previousBackendHll.merge({
                n: hyperloglog_config_1.REGISTERS_EXPONENT,
                buckets: previousBackend.hll,
            });
        }
        const currentBackendHll = (0, hyperloglog_lite_1.default)(hyperloglog_config_1.REGISTERS_EXPONENT);
        if (currentBackend) {
            currentBackendHll.merge({
                n: hyperloglog_config_1.REGISTERS_EXPONENT,
                buckets: currentBackend.hll,
            });
        }
        return {
            previous: previousHll.count(),
            current: currentHll.count(),
            previousFrontend: previousFrontendHll.count(),
            currentFrontend: currentFrontendHll.count(),
            previousBackend: previousBackendHll.count(),
            currentBackend: currentBackendHll.count(),
        };
    }
}
exports.UniqueConnectionReadModel = UniqueConnectionReadModel;
//# sourceMappingURL=unique-connection-read-model.js.map