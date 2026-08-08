"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectFlagCreatorsReadModel = void 0;
class ProjectFlagCreatorsReadModel {
    constructor(db) {
        this.db = db;
    }
    async getFlagCreators(project) {
        const result = await this.db('users')
            .distinct('users.id')
            .join('features', 'users.id', '=', 'features.created_by_user_id')
            .where('features.project', project)
            .where('features.archived_at', null)
            .select([
            'users.id',
            'users.name',
            'users.username',
            'users.email',
        ]);
        return result
            .filter((row) => row.name || row.username || row.email)
            .map((row) => ({
            id: Number(row.id),
            name: String(row.name || row.username || row.email),
        }));
    }
}
exports.ProjectFlagCreatorsReadModel = ProjectFlagCreatorsReadModel;
//# sourceMappingURL=project-flag-creators-read-model.js.map