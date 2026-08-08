"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeDependentFeaturesReadModel = void 0;
class FakeDependentFeaturesReadModel {
    getDependencies() {
        return Promise.resolve([]);
    }
    getChildren() {
        return Promise.resolve([]);
    }
    getParents() {
        return Promise.resolve([]);
    }
    getPossibleParentFeatures() {
        return Promise.resolve([]);
    }
    getPossibleParentVariants() {
        return Promise.resolve([]);
    }
    haveDependencies() {
        return Promise.resolve(false);
    }
    getOrphanParents(parentsAndChildren) {
        return Promise.resolve([]);
    }
    hasAnyDependencies() {
        return Promise.resolve(false);
    }
}
exports.FakeDependentFeaturesReadModel = FakeDependentFeaturesReadModel;
//# sourceMappingURL=fake-dependent-features-read-model.js.map