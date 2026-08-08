"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeFeatureLifecycleStore = void 0;
class FakeFeatureLifecycleStore {
    constructor() {
        this.lifecycles = {};
    }
    async insert(featureLifecycleStages) {
        const results = await Promise.all(featureLifecycleStages.map(async (stage) => {
            const success = await this.insertOne(stage);
            if (success) {
                return {
                    feature: stage.feature,
                    stage: stage.stage,
                };
            }
            return null;
        }));
        return results.filter((result) => result !== null);
    }
    async backfill() { }
    async insertOne(featureLifecycleStage) {
        if (await this.stageExists(featureLifecycleStage)) {
            return false;
        }
        const newStages = [];
        const existingStages = await this.get(featureLifecycleStage.feature);
        this.lifecycles[featureLifecycleStage.feature] = [
            ...existingStages,
            {
                stage: featureLifecycleStage.stage,
                ...(featureLifecycleStage.status
                    ? { status: featureLifecycleStage.status }
                    : {}),
                enteredStageAt: new Date(),
            },
        ];
        return true;
    }
    async get(feature) {
        return this.lifecycles[feature] || [];
    }
    async delete(feature) {
        this.lifecycles[feature] = [];
    }
    async deleteAll() {
        this.lifecycles = {};
    }
    async stageExists(stage) {
        const lifecycle = await this.get(stage.feature);
        return Boolean(lifecycle.find((s) => s.stage === stage.stage));
    }
    async deleteStage(stage) {
        if (!this.lifecycles[stage.feature]) {
            return;
        }
        const updatedStages = this.lifecycles[stage.feature].filter((s) => s.stage !== stage.stage);
        this.lifecycles[stage.feature] = updatedStages;
    }
}
exports.FakeFeatureLifecycleStore = FakeFeatureLifecycleStore;
//# sourceMappingURL=fake-feature-lifecycle-store.js.map