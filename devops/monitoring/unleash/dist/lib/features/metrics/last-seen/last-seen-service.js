"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LastSeenService = void 0;
class LastSeenService {
    constructor({ lastSeenStore }, config) {
        this.lastSeenToggles = new Map();
        this.lastSeenStore = lastSeenStore;
        this.logger = config.getLogger('/services/client-metrics/last-seen-service.ts');
    }
    async store() {
        const count = this.lastSeenToggles.size;
        if (count > 0) {
            const lastSeenToggles = Array.from(this.lastSeenToggles.values()).filter((lastSeen) => lastSeen.featureName.length <= 255);
            if (lastSeenToggles.length < this.lastSeenToggles.size) {
                this.logger.warn(`Toggles with long names ${JSON.stringify(Array.from(this.lastSeenToggles.values())
                    .filter((lastSeen) => lastSeen.featureName.length > 255)
                    .map((lastSeen) => lastSeen.featureName))}`);
            }
            this.logger.debug(`Updating last seen for ${lastSeenToggles.length} toggles`);
            this.lastSeenToggles = new Map();
            await this.lastSeenStore.setLastSeen(lastSeenToggles);
        }
        return count;
    }
    updateLastSeen(clientMetrics) {
        clientMetrics
            .filter((clientMetric) => !this.lastSeenToggles.has(`${clientMetric.featureName}:${clientMetric.environment}`))
            .filter((clientMetric) => clientMetric.yes > 0 || clientMetric.no > 0)
            .forEach((clientMetric) => {
            const key = `${clientMetric.featureName}:${clientMetric.environment}`;
            this.lastSeenToggles.set(key, {
                featureName: clientMetric.featureName,
                environment: clientMetric.environment,
            });
        });
    }
    async cleanLastSeen() {
        await this.lastSeenStore.cleanLastSeen();
    }
}
exports.LastSeenService = LastSeenService;
//# sourceMappingURL=last-seen-service.js.map