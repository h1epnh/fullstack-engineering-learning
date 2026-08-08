"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notfound_error_1 = __importDefault(require("../error/notfound-error"));
const util_1 = require("../util");
const T = {
    ROLE_USER: 'role_user',
    GROUP_ROLE: 'group_role',
    ROLES: 'roles',
};
const COLUMNS = ['id', 'name', 'description', 'type'];
class RoleStore {
    constructor(db, eventBus, getLogger) {
        this.db = db;
        this.eventBus = eventBus;
        this.logger = getLogger('lib/db/role-store.ts');
    }
    async getAll() {
        const rows = await this.db
            .select(COLUMNS)
            .from(T.ROLES)
            .orderBy('name', 'asc');
        return rows.map(this.mapRow);
    }
    async count() {
        return this.db
            .from(T.ROLES)
            .count('*')
            .then((res) => Number(res[0].count));
    }
    async filteredCount(filter) {
        return this.db
            .from(T.ROLES)
            .count('*')
            .where(filter)
            .then((res) => Number(res[0].count));
    }
    async filteredCountInUse(filter) {
        return this.db
            .from(T.ROLES)
            .countDistinct('roles.id')
            .leftJoin('role_user as ru', 'roles.id', 'ru.role_id')
            .leftJoin('groups as g', 'roles.id', 'g.root_role_id')
            .where(filter)
            .andWhere((qb) => qb.whereNotNull('ru.role_id').orWhereNotNull('g.root_role_id'))
            .then((res) => Number(res[0].count));
    }
    async create(role) {
        const row = await this.db(T.ROLES)
            .insert({
            name: role.name,
            description: role.description,
            type: role.roleType,
        })
            .returning('*');
        return this.mapRow(row[0]);
    }
    async delete(id) {
        return this.db(T.ROLES).where({ id }).del();
    }
    async get(id) {
        const rows = await this.db.select(COLUMNS).from(T.ROLES).where({ id });
        if (rows.length === 0) {
            throw new notfound_error_1.default(`Could not find role with id: ${id}`);
        }
        return this.mapRow(rows[0]);
    }
    async update(role) {
        const rows = await this.db(T.ROLES)
            .where({
            id: role.id,
        })
            .update({
            id: role.id,
            name: role.name,
            description: role.description,
        })
            .returning('*');
        return this.mapRow(rows[0]);
    }
    async exists(id) {
        const result = await this.db.raw(`SELECT EXISTS (SELECT 1 FROM ${T.ROLES} WHERE id = ?) AS present`, [id]);
        const { present } = result.rows[0];
        return present;
    }
    async nameInUse(name, existingId) {
        let query = this.db(T.ROLES).where({ name }).returning('id');
        if (existingId) {
            query = query.andWhereNot({ id: existingId });
        }
        const result = await query;
        return result.length > 0;
    }
    async deleteAll() {
        return this.db(T.ROLES).del();
    }
    mapRow(row) {
        if (!row) {
            throw new notfound_error_1.default('No row');
        }
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            type: row.type,
        };
    }
    async getRoles() {
        return this.db
            .select(['id', 'name', 'type', 'description'])
            .from(T.ROLES);
    }
    async getRoleWithId(id) {
        return this.db
            .select(['id', 'name', 'type', 'description'])
            .where('id', id)
            .first()
            .from(T.ROLES);
    }
    async getProjectRoles() {
        return this.db
            .select(['id', 'name', 'type', 'description'])
            .from(T.ROLES)
            .whereIn('type', util_1.PROJECT_ROLE_TYPES);
    }
    async getRolesForProject(projectId) {
        return this.db
            .select(['r.id', 'r.name', 'r.type', 'ru.project', 'r.description'])
            .from(`${T.ROLE_USER} as ru`)
            .innerJoin(`${T.ROLES} as r`, 'ru.role_id', 'r.id')
            .where('project', projectId);
    }
    async getRootRoles() {
        return this.db
            .select(['id', 'name', 'type', 'description'])
            .from(T.ROLES)
            .whereIn('type', util_1.ROOT_ROLE_TYPES);
    }
    async removeRolesForProject(projectId) {
        return this.db(T.ROLE_USER)
            .where({
            project: projectId,
        })
            .delete();
    }
    async getRootRoleForAllUsers() {
        const rows = await this.db
            .select('id', 'user_id')
            .distinctOn('user_id')
            .from(`${T.ROLES} AS r`)
            .leftJoin(`${T.ROLE_USER} AS ru`, 'r.id', 'ru.role_id')
            .whereIn('r.type', util_1.ROOT_ROLE_TYPES);
        return rows.map((row) => ({
            roleId: Number(row.id),
            userId: Number(row.user_id),
        }));
    }
    async getRoleByName(name) {
        return this.db(T.ROLES).where({ name }).first();
    }
    destroy() { }
}
exports.default = RoleStore;
//# sourceMappingURL=role-store.js.map