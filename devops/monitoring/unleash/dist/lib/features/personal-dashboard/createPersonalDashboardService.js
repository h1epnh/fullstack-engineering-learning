"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakePersonalDashboardService = exports.createPersonalDashboardService = void 0;
const personal_dashboard_service_1 = require("./personal-dashboard-service");
const personal_dashboard_read_model_1 = require("./personal-dashboard-read-model");
const fake_personal_dashboard_read_model_1 = require("./fake-personal-dashboard-read-model");
const project_owners_read_model_1 = require("../project/project-owners-read-model");
const fake_project_owners_read_model_1 = require("../project/fake-project-owners-read-model");
const project_read_model_1 = require("../project/project-read-model");
const fake_project_read_model_1 = require("../project/fake-project-read-model");
const event_store_1 = __importDefault(require("../../db/event-store"));
const feature_event_formatter_md_1 = require("../../addons/feature-event-formatter-md");
const fake_event_store_1 = __importDefault(require("../../../test/fixtures/fake-event-store"));
const fakePrivateProjectChecker_1 = require("../private-project/fakePrivateProjectChecker");
const privateProjectChecker_1 = require("../private-project/privateProjectChecker");
const account_store_1 = require("../../db/account-store");
const fake_account_store_1 = require("../../../test/fixtures/fake-account-store");
const onboarding_read_model_1 = require("../onboarding/onboarding-read-model");
const fake_onboarding_read_model_1 = require("../onboarding/fake-onboarding-read-model");
const access_store_1 = require("../../db/access-store");
const fake_access_store_1 = __importDefault(require("../../../test/fixtures/fake-access-store"));
const createPersonalDashboardService = (db, config, stores) => {
    return new personal_dashboard_service_1.PersonalDashboardService(new personal_dashboard_read_model_1.PersonalDashboardReadModel(db), new project_owners_read_model_1.ProjectOwnersReadModel(db), new project_read_model_1.ProjectReadModel(db, config.eventBus, config.flagResolver), new onboarding_read_model_1.OnboardingReadModel(db), new event_store_1.default(db, config.getLogger), new feature_event_formatter_md_1.FeatureEventFormatterMd({
        unleashUrl: config.server.unleashUrl,
        formatStyle: 'markdown',
    }), new privateProjectChecker_1.PrivateProjectChecker(stores, config), new account_store_1.AccountStore(db, config.getLogger), new access_store_1.AccessStore(db, config.eventBus, config.getLogger));
};
exports.createPersonalDashboardService = createPersonalDashboardService;
const createFakePersonalDashboardService = (config) => {
    return new personal_dashboard_service_1.PersonalDashboardService(new fake_personal_dashboard_read_model_1.FakePersonalDashboardReadModel(), new fake_project_owners_read_model_1.FakeProjectOwnersReadModel(), new fake_project_read_model_1.FakeProjectReadModel(), new fake_onboarding_read_model_1.FakeOnboardingReadModel(), new fake_event_store_1.default(), new feature_event_formatter_md_1.FeatureEventFormatterMd({
        unleashUrl: config.server.unleashUrl,
        formatStyle: 'markdown',
    }), new fakePrivateProjectChecker_1.FakePrivateProjectChecker(), new fake_account_store_1.FakeAccountStore(), new fake_access_store_1.default());
};
exports.createFakePersonalDashboardService = createFakePersonalDashboardService;
//# sourceMappingURL=createPersonalDashboardService.js.map