"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniqueConnectionService = void 0;
const hyperloglog_lite_1 = __importDefault(require("hyperloglog-lite"));
const metric_events_1 = require("../../metric-events");
const hyperloglog_config_1 = require("./hyperloglog-config");
class UniqueConnectionService {
    constructor({ uniqueConnectionStore, }, config) {
        this.hll = (0, hyperloglog_lite_1.default)(hyperloglog_config_1.REGISTERS_EXPONENT);
        this.backendHll = (0, hyperloglog_lite_1.default)(hyperloglog_config_1.REGISTERS_EXPONENT);
        this.frontendHll = (0, hyperloglog_lite_1.default)(hyperloglog_config_1.REGISTERS_EXPONENT);
        this.uniqueConnectionStore = uniqueConnectionStore;
        this.logger = config.getLogger('services/unique-connection-service.ts');
        this.flagResolver = config.flagResolver;
        this.eventBus = config.eventBus;
        this.activeHour = new Date().getHours();
    }
    listen() {
        this.eventBus.on(metric_events_1.SDK_CONNECTION_ID_RECEIVED, this.count.bind(this));
    }
    count({ connectionId, type, }) {
        if (!this.flagResolver.isEnabled('uniqueSdkTracking'))
            return;
        const value = hyperloglog_lite_1.default.hash(connectionId);
        this.hll.add(value);
        if (type === 'frontend') {
            this.frontendHll.add(value);
        }
        else if (type === 'backend') {
            this.backendHll.add(value);
        }
    }
    async sync(currentTime = new Date()) {
        if (!this.flagResolver.isEnabled('uniqueSdkTracking'))
            return;
        const currentHour = currentTime.getHours();
        await this.syncBuckets(currentTime, 'current', 'previous');
        await this.syncBuckets(currentTime, 'currentBackend', 'previousBackend');
        await this.syncBuckets(currentTime, 'currentFrontend', 'previousFrontend');
        if (this.activeHour !== currentHour) {
            this.activeHour = currentHour;
        }
    }
    resetHll(bucketId) {
        if (bucketId.toLowerCase().includes('frontend')) {
            this.frontendHll = (0, hyperloglog_lite_1.default)(hyperloglog_config_1.REGISTERS_EXPONENT);
        }
        else if (bucketId.toLowerCase().includes('backend')) {
            this.backendHll = (0, hyperloglog_lite_1.default)(hyperloglog_config_1.REGISTERS_EXPONENT);
        }
        else {
            this.hll = (0, hyperloglog_lite_1.default)(hyperloglog_config_1.REGISTERS_EXPONENT);
        }
    }
    getHll(bucketId) {
        if (bucketId.toLowerCase().includes('frontend')) {
            return this.frontendHll;
        }
        else if (bucketId.toLowerCase().includes('backend')) {
            return this.backendHll;
        }
        else {
            return this.hll;
        }
    }
    async syncBuckets(currentTime, current, previous) {
        const currentHour = currentTime.getHours();
        const currentBucket = await this.uniqueConnectionStore.get(current);
        if (this.activeHour !== currentHour && currentBucket) {
            if (currentBucket.updatedAt.getHours() < currentHour) {
                this.getHll(current).merge({
                    n: hyperloglog_config_1.REGISTERS_EXPONENT,
                    buckets: currentBucket.hll,
                });
                await this.uniqueConnectionStore.insert({
                    hll: this.getHll(current).output().buckets,
                    id: previous,
                });
            }
            else {
                const previousBucket = await this.uniqueConnectionStore.get(previous);
                if (previousBucket) {
                    this.getHll(current).merge({
                        n: hyperloglog_config_1.REGISTERS_EXPONENT,
                        buckets: previousBucket.hll,
                    });
                }
                await this.uniqueConnectionStore.insert({
                    hll: this.getHll(current).output().buckets,
                    id: previous,
                });
            }
            this.resetHll(current);
        }
        else if (currentBucket) {
            this.getHll(current).merge({
                n: hyperloglog_config_1.REGISTERS_EXPONENT,
                buckets: currentBucket.hll,
            });
        }
        await this.uniqueConnectionStore.insert({
            hll: this.getHll(current).output().buckets,
            id: current,
        });
    }
}
exports.UniqueConnectionService = UniqueConnectionService;
//# sourceMappingURL=unique-connection-service.js.map