"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FakeClientFeatureToggleStore {
    constructor() {
        this.featureToggles = [];
    }
    async getFeatures(featureQuery, archived = false) {
        const rows = this.featureToggles.filter((toggle) => {
            if (featureQuery?.namePrefix) {
                if (featureQuery.project) {
                    return (toggle.name.startsWith(featureQuery.namePrefix) &&
                        featureQuery.project.some((project) => project.includes(toggle.project)));
                }
                return toggle.name.startsWith(featureQuery.namePrefix);
            }
            if (featureQuery?.project) {
                return featureQuery.project.some((project) => project.includes(toggle.project));
            }
            return toggle.archived === archived;
        });
        const clientRows = rows.map((t) => ({
            ...t,
            enabled: true,
            strategies: [],
            description: t.description,
            type: t.type || 'Release',
            stale: t.stale || false,
            variants: [],
            tags: [],
        }));
        return Promise.resolve(clientRows);
    }
    async getClient(query) {
        return this.getFeatures(query);
    }
    async getFrontendApiClient(query) {
        return this.getFeatures(query);
    }
    async getPlayground(query) {
        const features = await this.getFeatures(query);
        return features.map(({ strategies, ...rest }) => ({
            ...rest,
            strategies: strategies.map((strategy, index) => ({
                ...strategy,
                id: `strategy#${index}`,
            })),
        }));
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async createFeature(feature) {
        this.featureToggles.push({
            project: feature.project || 'default',
            createdAt: new Date(),
            archived: false,
            ...feature,
        });
        return Promise.resolve();
    }
}
exports.default = FakeClientFeatureToggleStore;
//# sourceMappingURL=fake-client-feature-toggle-store.js.map