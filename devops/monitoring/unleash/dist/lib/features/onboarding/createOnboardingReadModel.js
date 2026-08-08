"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeOnboardingReadModel = exports.createOnboardingReadModel = void 0;
const onboarding_read_model_1 = require("./onboarding-read-model");
const fake_onboarding_read_model_1 = require("./fake-onboarding-read-model");
const createOnboardingReadModel = (db) => {
    return new onboarding_read_model_1.OnboardingReadModel(db);
};
exports.createOnboardingReadModel = createOnboardingReadModel;
const createFakeOnboardingReadModel = () => {
    return new fake_onboarding_read_model_1.FakeOnboardingReadModel();
};
exports.createFakeOnboardingReadModel = createFakeOnboardingReadModel;
//# sourceMappingURL=createOnboardingReadModel.js.map