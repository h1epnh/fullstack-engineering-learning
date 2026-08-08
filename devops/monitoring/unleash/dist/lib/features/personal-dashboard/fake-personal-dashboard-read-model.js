"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakePersonalDashboardReadModel = void 0;
class FakePersonalDashboardReadModel {
    async getLatestHealthScores(project, count) {
        return [];
    }
    async getPersonalFeatures(userId) {
        return [];
    }
    async getPersonalProjects(userId) {
        return [];
    }
    async getAdmins() {
        return [];
    }
}
exports.FakePersonalDashboardReadModel = FakePersonalDashboardReadModel;
//# sourceMappingURL=fake-personal-dashboard-read-model.js.map