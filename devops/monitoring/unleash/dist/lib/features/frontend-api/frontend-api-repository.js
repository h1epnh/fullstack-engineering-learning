"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrontendApiRepository = void 0;
const events_1 = __importDefault(require("events"));
const unleash_client_1 = require("unleash-client");
class FrontendApiRepository extends events_1.default {
    constructor(config, globalFrontendApiCache, token) {
        super();
        this.config = config;
        this.logger = config.getLogger('frontend-api-repository.ts');
        this.token = token;
        this.globalFrontendApiCache = globalFrontendApiCache;
    }
    getTogglesWithSegmentData() {
        // TODO: add real implementation
        return [];
    }
    getSegment(id) {
        return this.globalFrontendApiCache.getSegment(id);
    }
    getToggle(name) {
        return this.globalFrontendApiCache.getToggle(name, this.token);
    }
    getToggles() {
        return this.globalFrontendApiCache.getToggles(this.token);
    }
    async start() {
        this.running = true;
        this.emit(unleash_client_1.UnleashEvents.Ready);
        this.emit(unleash_client_1.UnleashEvents.Changed);
    }
    stop() {
        this.running = false;
    }
}
exports.FrontendApiRepository = FrontendApiRepository;
//# sourceMappingURL=frontend-api-repository.js.map