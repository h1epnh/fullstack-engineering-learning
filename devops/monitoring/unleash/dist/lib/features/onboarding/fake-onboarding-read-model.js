"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeOnboardingReadModel = void 0;
class FakeOnboardingReadModel {
    getInstanceOnboardingMetrics() {
        return Promise.resolve({
            firstLogin: null,
            secondLogin: null,
            firstFeatureFlag: null,
            firstPreLive: null,
            firstLive: null,
        });
    }
    getProjectsOnboardingMetrics() {
        return Promise.resolve([]);
    }
    async getOnboardingStatusForProject() {
        return null;
    }
}
exports.FakeOnboardingReadModel = FakeOnboardingReadModel;
//# sourceMappingURL=fake-onboarding-read-model.js.map