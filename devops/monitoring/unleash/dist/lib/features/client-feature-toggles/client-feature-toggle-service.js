"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientFeatureToggleService = void 0;
class ClientFeatureToggleService {
    constructor({ clientFeatureToggleStore, }, segmentReadModel, clientFeatureToggleCache, { getLogger }) {
        this.clientFeatureToggleDelta = null;
        this.logger = getLogger('services/client-feature-toggle-service.ts');
        this.segmentReadModel = segmentReadModel;
        this.clientFeatureToggleDelta = clientFeatureToggleCache;
        this.clientFeatureToggleStore = clientFeatureToggleStore;
    }
    async getActiveSegmentsForClient() {
        return this.segmentReadModel.getActiveForClient();
    }
    async getClientDelta(revisionId, query) {
        if (this.clientFeatureToggleDelta !== null) {
            return this.clientFeatureToggleDelta.getDelta(revisionId, query);
        }
        else {
            throw new Error('Calling the partial updates but the cache is not initialized');
        }
    }
    async getClientFeatures(query) {
        const result = await this.clientFeatureToggleStore.getClient(query || {});
        return result.map(({ name, type, enabled, project, stale, strategies, variants, description, impressionData, dependencies, }) => ({
            name,
            type,
            enabled,
            project,
            stale,
            strategies,
            variants,
            description,
            impressionData,
            dependencies,
        }));
    }
}
exports.ClientFeatureToggleService = ClientFeatureToggleService;
//# sourceMappingURL=client-feature-toggle-service.js.map