"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivateProjectChecker = void 0;
const privateProjectStore_1 = require("./privateProjectStore");
class PrivateProjectChecker {
    constructor({ privateProjectStore }, { isEnterprise }) {
        this.privateProjectStore = privateProjectStore;
        this.isEnterprise = isEnterprise;
    }
    async getUserAccessibleProjects(userId) {
        return this.isEnterprise
            ? this.privateProjectStore.getUserAccessibleProjects(userId)
            : Promise.resolve(privateProjectStore_1.ALL_PROJECT_ACCESS);
    }
    async filterUserAccessibleProjects(userId, projects) {
        if (!this.isEnterprise) {
            return projects;
        }
        const accessibleProjects = await this.privateProjectStore.getUserAccessibleProjects(userId);
        if (accessibleProjects.mode === 'all')
            return projects;
        return projects.filter((project) => accessibleProjects.projects.includes(project));
    }
    async hasAccessToProject(userId, projectId) {
        const projectAccess = await this.getUserAccessibleProjects(userId);
        return (projectAccess.mode === 'all' ||
            projectAccess.projects.includes(projectId));
    }
}
exports.PrivateProjectChecker = PrivateProjectChecker;
//# sourceMappingURL=privateProjectChecker.js.map