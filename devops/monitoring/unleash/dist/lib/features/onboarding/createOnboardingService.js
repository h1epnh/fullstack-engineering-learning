"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeOnboardingService = exports.createOnboardingService = void 0;
const onboarding_service_1 = require("./onboarding-service");
const onboarding_store_1 = require("./onboarding-store");
const project_read_model_1 = require("../project/project-read-model");
const user_store_1 = __importDefault(require("../../db/user-store"));
const fake_user_store_1 = __importDefault(require("../../../test/fixtures/fake-user-store"));
const fake_project_read_model_1 = require("../project/fake-project-read-model");
const fake_onboarding_store_1 = require("./fake-onboarding-store");
const createOnboardingService = (config) => (db) => {
    const { eventBus, flagResolver, getLogger } = config;
    const onboardingStore = new onboarding_store_1.OnboardingStore(db);
    const projectReadModel = new project_read_model_1.ProjectReadModel(db, eventBus, flagResolver);
    const userStore = new user_store_1.default(db, getLogger, flagResolver);
    const onboardingService = new onboarding_service_1.OnboardingService({
        onboardingStore,
        projectReadModel,
        userStore,
    }, config);
    return onboardingService;
};
exports.createOnboardingService = createOnboardingService;
const createFakeOnboardingService = (config) => {
    const onboardingStore = new fake_onboarding_store_1.FakeOnboardingStore();
    const projectReadModel = new fake_project_read_model_1.FakeProjectReadModel();
    const userStore = new fake_user_store_1.default();
    const onboardingService = new onboarding_service_1.OnboardingService({
        onboardingStore,
        projectReadModel,
        userStore,
    }, config);
    return { onboardingService, projectReadModel, userStore, onboardingStore };
};
exports.createFakeOnboardingService = createFakeOnboardingService;
//# sourceMappingURL=createOnboardingService.js.map