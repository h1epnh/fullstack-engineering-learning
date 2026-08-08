"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeProjectReadModel = exports.createProjectReadModel = void 0;
const project_read_model_1 = require("./project-read-model");
const fake_project_read_model_1 = require("./fake-project-read-model");
const createProjectReadModel = (db, eventBus, flagResolver) => {
    return new project_read_model_1.ProjectReadModel(db, eventBus, flagResolver);
};
exports.createProjectReadModel = createProjectReadModel;
const createFakeProjectReadModel = () => {
    return new fake_project_read_model_1.FakeProjectReadModel();
};
exports.createFakeProjectReadModel = createFakeProjectReadModel;
//# sourceMappingURL=createProjectReadModel.js.map