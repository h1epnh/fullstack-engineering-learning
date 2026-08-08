"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FakeClientFeatureToggleReadModel {
    constructor(value = {}) {
        this.value = value;
    }
    getAll() {
        return Promise.resolve(this.value);
    }
    setValue(value) {
        this.value = value;
    }
}
exports.default = FakeClientFeatureToggleReadModel;
//# sourceMappingURL=fake-client-feature-toggle-read-model.js.map