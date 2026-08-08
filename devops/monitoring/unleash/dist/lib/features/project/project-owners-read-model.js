"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectOwnersReadModel = void 0;
const types_1 = require("../../types");
const util_1 = require("../../util");
const T = {
    ROLE_USER: 'role_user',
    GROUP_ROLE: 'group_role',
    ROLES: 'roles',
    USERS: 'users',
};
class ProjectOwnersReadModel {
    constructor(db) {
        this.db = db;
    }
    static addOwnerData(projects, owners) {
        return projects.map((project) => ({
            ...project,
            owners: owners[project.id] || [{ ownerType: 'system' }],
        }));
    }
    async getAllProjectUsersByRole(roleId) {
        const usersResult = await this.db
            .select('user.id', 'user.username', 'user.name', 'user.email', 'user.image_url', 'ru.created_at', 'ru.project')
            .from(`${T.ROLE_USER} as ru`)
            .orderBy('ru.created_at', 'asc')
            .join(`${T.ROLES} as r`, 'ru.role_id', 'r.id')
            .where('r.id', roleId)
            .join(`${T.USERS} as user`, 'ru.user_id', 'user.id');
        const usersDict = {};
        usersResult.forEach((user) => {
            const project = user.project;
            const data = {
                ownerType: 'user',
                name: user?.name || user?.username || user?.email,
                email: user?.email,
                imageUrl: (0, util_1.generateImageUrl)(user),
            };
            if (project in usersDict) {
                usersDict[project] = [...usersDict[project], data];
            }
            else {
                usersDict[project] = [data];
            }
        });
        return usersDict;
    }
    async getAllProjectGroupsByRole(roleId) {
        const groupsResult = await this.db
            .select('groups.name', 'gr.created_at', 'gr.project')
            .from(`${T.GROUP_ROLE} as gr`)
            .orderBy('gr.created_at', 'asc')
            .join(`${T.ROLES} as r`, 'gr.role_id', 'r.id')
            .where('r.id', roleId)
            .join('groups', 'gr.group_id', 'groups.id');
        const groupsDict = {};
        groupsResult.forEach((group) => {
            const project = group.project;
            const data = {
                ownerType: 'group',
                name: group?.name,
            };
            if (project in groupsDict) {
                groupsDict[project] = [...groupsDict[project], data];
            }
            else {
                groupsDict[project] = [data];
            }
        });
        return groupsDict;
    }
    async getProjectOwnersDictionary() {
        const ownerRole = await this.db(T.ROLES)
            .where({ name: types_1.RoleName.OWNER })
            .first();
        const usersDict = await this.getAllProjectUsersByRole(ownerRole.id);
        const groupsDict = await this.getAllProjectGroupsByRole(ownerRole.id);
        const dict = usersDict;
        Object.keys(groupsDict).forEach((project) => {
            if (project in dict) {
                dict[project] = dict[project].concat(groupsDict[project]);
            }
            else {
                dict[project] = groupsDict[project];
            }
        });
        return dict;
    }
    async getAllUserProjectOwners(projects) {
        const allOwners = await this.getProjectOwnersDictionary();
        const owners = projects
            ? Object.entries(allOwners)
                .filter(([projectId]) => projects.has(projectId))
                .map(([_, owners]) => owners)
            : Object.values(allOwners);
        const ownersDict = owners.flat().reduce((acc, owner) => {
            if (owner.ownerType === 'user') {
                acc[owner.email || owner.name] = owner;
            }
            return acc;
        }, {});
        return Object.values(ownersDict);
    }
    async addOwners(projects) {
        const owners = await this.getProjectOwnersDictionary();
        return ProjectOwnersReadModel.addOwnerData(projects, owners);
    }
    async getProjectOwners(projectId) {
        const owners = await this.getProjectOwnersDictionary();
        return owners[projectId] ?? [{ ownerType: 'system' }];
    }
}
exports.ProjectOwnersReadModel = ProjectOwnersReadModel;
//# sourceMappingURL=project-owners-read-model.js.map