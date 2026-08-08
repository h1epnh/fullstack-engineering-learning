"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeProjectLifecycleSummaryReadModel = exports.createProjectLifecycleSummaryReadModel = void 0;
const feature_toggle_store_1 = __importDefault(require("../../feature-toggle/feature-toggle-store"));
const fake_project_lifecycle_summary_read_model_1 = require("./fake-project-lifecycle-summary-read-model");
const project_lifecycle_summary_read_model_1 = require("./project-lifecycle-summary-read-model");
const createProjectLifecycleSummaryReadModel = (db, config) => {
    const { eventBus, getLogger, flagResolver } = config;
    const featureToggleStore = new feature_toggle_store_1.default(db, eventBus, getLogger, flagResolver);
    return new project_lifecycle_summary_read_model_1.ProjectLifecycleSummaryReadModel(db, featureToggleStore);
};
exports.createProjectLifecycleSummaryReadModel = createProjectLifecycleSummaryReadModel;
const createFakeProjectLifecycleSummaryReadModel = () => {
    return new fake_project_lifecycle_summary_read_model_1.FakeProjectLifecycleSummaryReadModel();
};
exports.createFakeProjectLifecycleSummaryReadModel = createFakeProjectLifecycleSummaryReadModel;
//# sourceMappingURL=createProjectLifecycleSummaryReadModel.js.map