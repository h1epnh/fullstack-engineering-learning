"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPDATE_REVISION = void 0;
const events_1 = __importDefault(require("events"));
exports.UPDATE_REVISION = 'UPDATE_REVISION';
class ConfigurationRevisionService extends events_1.default {
    constructor({ eventStore }, { getLogger, flagResolver, }) {
        super();
        this.logger = getLogger('configuration-revision-service.ts');
        this.eventStore = eventStore;
        this.flagResolver = flagResolver;
        this.revisionId = 0;
    }
    static getInstance({ eventStore }, { getLogger, flagResolver, }) {
        if (!ConfigurationRevisionService.instance) {
            ConfigurationRevisionService.instance =
                new ConfigurationRevisionService({ eventStore }, { getLogger, flagResolver });
        }
        return ConfigurationRevisionService.instance;
    }
    async getMaxRevisionId() {
        if (this.revisionId > 0) {
            return this.revisionId;
        }
        else {
            return this.updateMaxRevisionId();
        }
    }
    async updateMaxRevisionId(emit = true) {
        if (this.flagResolver.isEnabled('disableUpdateMaxRevisionId')) {
            return 0;
        }
        const revisionId = await this.eventStore.getMaxRevisionId(this.revisionId);
        if (this.revisionId !== revisionId) {
            this.logger.debug('Updating feature configuration with new revision Id', revisionId);
            this.revisionId = revisionId;
            if (emit) {
                this.emit(exports.UPDATE_REVISION, revisionId);
            }
        }
        return this.revisionId;
    }
    destroy() {
        ConfigurationRevisionService.instance?.removeAllListeners();
    }
}
exports.default = ConfigurationRevisionService;
//# sourceMappingURL=configuration-revision-service.js.map