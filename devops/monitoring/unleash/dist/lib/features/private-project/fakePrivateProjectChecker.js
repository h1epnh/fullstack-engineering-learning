"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakePrivateProjectChecker = void 0;
const privateProjectStore_1 = require("./privateProjectStore");
class FakePrivateProjectChecker {
    async filterUserAccessibleProjects(userId, projects) {
        return projects;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getUserAccessibleProjects(userId) {
        return privateProjectStore_1.ALL_PROJECT_ACCESS;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hasAccessToProject(userId, projectId) {
        throw new Error('Method not implemented.');
    }
}
exports.FakePrivateProjectChecker = FakePrivateProjectChecker;
//# sourceMappingURL=fakePrivateProjectChecker.js.map