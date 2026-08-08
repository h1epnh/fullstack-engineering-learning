"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeProjectOwnersReadModel = void 0;
class FakeProjectOwnersReadModel {
    async addOwners(projects) {
        return projects.map((project) => ({
            ...project,
            owners: [{ ownerType: 'system' }],
        }));
    }
    async getAllUserProjectOwners() {
        return [];
    }
    async getProjectOwners() {
        return [];
    }
}
exports.FakeProjectOwnersReadModel = FakeProjectOwnersReadModel;
//# sourceMappingURL=fake-project-owners-read-model.js.map