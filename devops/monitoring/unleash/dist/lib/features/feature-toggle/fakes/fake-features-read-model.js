"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeFeaturesReadModel = void 0;
class FakeFeaturesReadModel {
    featureExists() {
        return Promise.resolve(false);
    }
    featuresInTheSameProject(featureA, featureB) {
        return Promise.resolve(true);
    }
}
exports.FakeFeaturesReadModel = FakeFeaturesReadModel;
//# sourceMappingURL=fake-features-read-model.js.map