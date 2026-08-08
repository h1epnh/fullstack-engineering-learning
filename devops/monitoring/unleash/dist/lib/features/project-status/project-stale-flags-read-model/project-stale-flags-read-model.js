"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectStaleFlagsReadModel = void 0;
class ProjectStaleFlagsReadModel {
    constructor(db) {
        this.db = db;
    }
    async getStaleFlagCountForProject(projectId) {
        const result = await this.db('features')
            .count()
            .whereNull('archived_at')
            .where({ project: projectId })
            .where((builder) => builder
            .orWhere({ stale: true })
            .orWhere({ potentially_stale: true }));
        return Number(result[0].count);
    }
}
exports.ProjectStaleFlagsReadModel = ProjectStaleFlagsReadModel;
//# sourceMappingURL=project-stale-flags-read-model.js.map