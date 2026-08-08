"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalDashboardReadModel = void 0;
class PersonalDashboardReadModel {
    constructor(db) {
        this.db = db;
    }
    async getLatestHealthScores(project, count) {
        const results = await this.db('flag_trends')
            .select('health')
            .orderBy('created_at', 'desc')
            .where('project', project)
            .limit(count);
        return results.map((row) => Number(row.health));
    }
    async getPersonalProjects(userId) {
        const result = await this.db('projects')
            .join('role_user', 'projects.id', 'role_user.project')
            .join('roles', 'role_user.role_id', 'roles.id')
            .leftJoin('group_user', (join) => {
            join.on('group_user.user_id', '=', this.db.raw('?', [userId]));
        })
            .leftJoin('group_role', 'group_role.group_id', 'group_user.group_id')
            .leftJoin('roles as group_roles', 'group_role.role_id', 'group_roles.id')
            .where('role_user.user_id', userId)
            .orWhere('group_user.user_id', userId)
            .whereNull('projects.archived_at')
            .select('projects.name', 'projects.id', 'roles.id as roleId', 'roles.name as roleName', 'roles.type as roleType')
            .limit(100);
        const dict = result.reduce((acc, row) => {
            if (acc[row.id]) {
                acc[row.id].roles[row.roleId] = {
                    id: row.roleId,
                    name: row.roleName,
                    type: row.roleType,
                };
            }
            else {
                acc[row.id] = {
                    id: row.id,
                    name: row.name,
                    roles: {
                        [row.roleId]: {
                            id: row.roleId,
                            name: row.roleName,
                            type: row.roleType,
                        },
                    },
                };
            }
            return acc;
        }, {});
        const projectList = Object.values(dict).map((project) => {
            const roles = Object.values(project.roles);
            roles.sort((a, b) => a.id - b.id);
            return {
                ...project,
                roles,
            };
        });
        projectList.sort((a, b) => a.name.localeCompare(b.name));
        return projectList;
    }
    async getPersonalFeatures(userId) {
        const result = await this.db('favorite_features')
            .join('features', 'favorite_features.feature', 'features.name')
            .where('favorite_features.user_id', userId)
            .whereNull('features.archived_at')
            .select('features.name as name', 'features.type', 'features.project', 'features.created_at')
            .union(function () {
            this.select('name', 'type', 'project', 'created_at')
                .from('features')
                .where('features.created_by_user_id', userId)
                .whereNull('features.archived_at');
        })
            .orderBy('created_at', 'desc')
            .limit(100);
        return result.map((row) => ({
            name: row.name,
            type: row.type,
            project: row.project,
        }));
    }
}
exports.PersonalDashboardReadModel = PersonalDashboardReadModel;
//# sourceMappingURL=personal-dashboard-read-model.js.map