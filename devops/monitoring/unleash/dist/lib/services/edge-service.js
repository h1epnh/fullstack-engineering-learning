"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const metrics_helper_1 = __importDefault(require("../util/metrics-helper"));
const metric_events_1 = require("../metric-events");
class EdgeService {
    constructor({ apiTokenService }, { getLogger, eventBus, }) {
        this.logger = getLogger('lib/services/edge-service.ts');
        this.apiTokenService = apiTokenService;
        this.timer = (functionName) => metrics_helper_1.default.wrapTimer(eventBus, metric_events_1.FUNCTION_TIME, {
            className: 'EdgeService',
            functionName,
        });
    }
    async getValidTokens(tokens) {
        const stopTimer = this.timer('validateTokensWithCache');
        // new behavior: use cached tokens when possible
        // use the db to fetch the missing ones
        // cache stores both missing and active so we don't hammer the db
        const validatedTokens = [];
        for (const token of tokens) {
            const found = await this.apiTokenService.getTokenWithCache(token);
            if (found) {
                validatedTokens.push({
                    token: token,
                    type: found.type,
                    projects: found.projects,
                });
            }
        }
        stopTimer();
        return { tokens: validatedTokens };
    }
}
exports.default = EdgeService;
module.exports = EdgeService;
//# sourceMappingURL=edge-service.js.map