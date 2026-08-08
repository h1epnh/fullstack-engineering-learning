"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeProjectReadModel = void 0;
class FakeProjectReadModel {
    getFeatureProject() {
        return Promise.resolve(null);
    }
    getProjectsForAdminUi() {
        return Promise.resolve([]);
    }
    getProjectsForInsights() {
        return Promise.resolve([]);
    }
    getProjectsByUser() {
        return Promise.resolve([]);
    }
    getProjectsFavoritedByUser() {
        return Promise.resolve([]);
    }
}
exports.FakeProjectReadModel = FakeProjectReadModel;
//# sourceMappingURL=fake-project-read-model.js.map