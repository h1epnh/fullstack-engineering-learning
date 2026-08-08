"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_PROJECT_ACCESS = void 0;
const types_1 = require("../../types");
exports.ALL_PROJECT_ACCESS = {
    mode: 'all',
};
class PrivateProjectStore {
    constructor(db, getLogger) {
        this.db = db;
        this.logger = getLogger('project-permission-store.ts');
    }
    destroy() { }
    async getUserAccessibleProjects(userId) {
        if (userId === types_1.ADMIN_TOKEN_USER.id) {
            return exports.ALL_PROJECT_ACCESS;
        }
        const isViewer = await this.db('role_user')
            .join('roles', 'role_user.role_id', 'roles.id')
            .where('role_user.user_id', userId)
            .andWhere({
            'roles.name': 'Viewer',
            'roles.type': 'root',
        })
            .count('*')
            .then((res) => Number(res[0].count));
        if (isViewer === 0) {
            return exports.ALL_PROJECT_ACCESS;
        }
        const accessibleProjects = await this.db
            .from((db) => {
            db.distinct()
                .select('projects.id as project_id')
                .from('projects')
                .leftJoin('project_settings', 'projects.id', 'project_settings.project')
                .where((builder) => {
                builder
                    .whereNull('project_settings.project')
                    .orWhere('project_settings.project_mode', '!=', 'private');
            })
                .unionAll((queryBuilder) => {
                queryBuilder
                    .select('projects.id as project_id')
                    .from('projects')
                    .join('project_settings', 'projects.id', 'project_settings.project')
                    .where('project_settings.project_mode', '=', 'private')
                    .whereIn('projects.id', (whereBuilder) => {
                    whereBuilder
                        .select('role_user.project')
                        .from('role_user')
                        .leftJoin('roles', 'role_user.role_id', 'roles.id')
                        .where('role_user.user_id', userId);
                })
                    .orWhereIn('projects.id', (whereBuilder) => {
                    whereBuilder
                        .select('group_role.project')
                        .from('group_role')
                        .leftJoin('group_user', 'group_user.group_id', 'group_role.group_id')
                        .where('group_user.user_id', userId);
                });
            })
                .as('accessible_projects');
        })
            .select('*')
            .pluck('project_id');
        return { mode: 'limited', projects: accessibleProjects };
    }
}
exports.default = PrivateProjectStore;
//# sourceMappingURL=privateProjectStore.js.map