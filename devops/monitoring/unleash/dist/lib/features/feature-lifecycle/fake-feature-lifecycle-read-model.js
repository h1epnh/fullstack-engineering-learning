"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeFeatureLifecycleReadModel = void 0;
class FakeFeatureLifecycleReadModel {
    getAllWithStageDuration() {
        return Promise.resolve([]);
    }
    getStageCount() {
        return Promise.resolve([]);
    }
    getStageCountByProject() {
        return Promise.resolve([]);
    }
    findCurrentStage(feature) {
        return Promise.resolve(undefined);
    }
}
exports.FakeFeatureLifecycleReadModel = FakeFeatureLifecycleReadModel;
//# sourceMappingURL=fake-feature-lifecycle-read-model.js.map