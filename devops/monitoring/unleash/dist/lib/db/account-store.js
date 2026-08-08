"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountStore = void 0;
const user_1 = __importDefault(require("../types/user"));
const notfound_error_1 = __importDefault(require("../error/notfound-error"));
const TABLE = 'users';
const USER_COLUMNS_PUBLIC = [
    'id',
    'name',
    'username',
    'email',
    'image_url',
    'seen_at',
    'is_service',
];
const USER_COLUMNS = [...USER_COLUMNS_PUBLIC, 'login_attempts', 'created_at'];
const emptify = (value) => {
    if (!value) {
        return undefined;
    }
    return value;
};
const safeToLower = (s) => (s ? s.toLowerCase() : s);
const rowToUser = (row) => {
    if (!row) {
        throw new notfound_error_1.default('No user found');
    }
    return new user_1.default({
        id: row.id,
        name: emptify(row.name),
        username: emptify(row.username),
        email: emptify(row.email),
        imageUrl: emptify(row.image_url),
        loginAttempts: row.login_attempts,
        seenAt: row.seen_at,
        createdAt: row.created_at,
        isService: row.is_service,
    });
};
class AccountStore {
    constructor(db, getLogger) {
        this.db = db;
        this.logger = getLogger('account-store.ts');
    }
    buildSelectAccount(q) {
        const query = this.activeAccounts();
        if (q.id) {
            return query.where('id', q.id);
        }
        if (q.email) {
            return query.where('email', safeToLower(q.email));
        }
        if (q.username) {
            return query.where('username', q.username);
        }
        throw new Error('Can only find users with id, username or email.');
    }
    activeAccounts() {
        return this.db(TABLE).where({
            deleted_at: null,
            is_system: false,
        });
    }
    async hasAccount(idQuery) {
        const query = this.buildSelectAccount(idQuery);
        const item = await query.first('id');
        return item ? item.id : undefined;
    }
    async getAll() {
        const users = await this.activeAccounts().select(USER_COLUMNS);
        return users.map(rowToUser);
    }
    async search(query) {
        const users = await this.activeAccounts()
            .select(USER_COLUMNS_PUBLIC)
            .where('name', 'ILIKE', `%${query}%`)
            .orWhere('username', 'ILIKE', `${query}%`)
            .orWhere('email', 'ILIKE', `${query}%`);
        return users.map(rowToUser);
    }
    async getAllWithId(userIdList) {
        const users = await this.activeAccounts()
            .select(USER_COLUMNS_PUBLIC)
            .whereIn('id', userIdList);
        return users.map(rowToUser);
    }
    async getByQuery(idQuery) {
        const row = await this.buildSelectAccount(idQuery).first(USER_COLUMNS);
        return rowToUser(row);
    }
    async delete(id) {
        return this.activeAccounts()
            .where({ id })
            .update({
            deleted_at: new Date(),
            email: null,
            username: null,
            name: this.db.raw('name || ?', '(Deleted)'),
        });
    }
    async deleteAll() {
        await this.activeAccounts().del();
    }
    async count() {
        return this.activeAccounts()
            .count('*')
            .then((res) => Number(res[0].count));
    }
    destroy() { }
    async exists(id) {
        const result = await this.db.raw(`SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE id = ? and deleted_at = null) AS present`, [id]);
        const { present } = result.rows[0];
        return present;
    }
    async get(id) {
        const row = await this.activeAccounts().where({ id }).first();
        return rowToUser(row);
    }
    async getAccountByPersonalAccessToken(secret) {
        const row = await this.activeAccounts()
            .select(USER_COLUMNS.map((column) => `${TABLE}.${column}`))
            .leftJoin('personal_access_tokens', 'personal_access_tokens.user_id', `${TABLE}.id`)
            .where('secret', secret)
            .andWhere('expires_at', '>', 'now()')
            .first();
        return rowToUser(row);
    }
    async markSeenAt(secrets) {
        const now = new Date();
        try {
            await this.db('personal_access_tokens')
                .whereIn('secret', secrets)
                .update({ seen_at: now });
        }
        catch (err) {
            this.logger.error('Could not update lastSeen, error: ', err);
        }
    }
    async getAdminCount() {
        const adminCount = await this.activeAccounts()
            .join('role_user as ru', 'users.id', 'ru.user_id')
            .where('ru.role_id', '=', this.db.raw('(SELECT id FROM roles WHERE name = ?)', ['Admin']))
            .select(this.db.raw('COUNT(CASE WHEN users.password_hash IS NOT NULL AND users.is_service = false THEN 1 END)::integer AS password'), this.db.raw('COUNT(CASE WHEN users.password_hash IS NULL AND users.is_service = false THEN 1 END)::integer AS no_password'), this.db.raw('COUNT(CASE WHEN users.is_service = true THEN 1 END)::integer AS service'));
        return {
            password: adminCount[0].password,
            noPassword: adminCount[0].no_password,
            service: adminCount[0].service,
        };
    }
    async getAdmins() {
        const rowToAdminUser = (row) => {
            const user = rowToUser(row);
            return {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                imageUrl: user.imageUrl,
            };
        };
        const admins = await this.activeAccounts()
            .join('role_user as ru', 'users.id', 'ru.user_id')
            .where('ru.role_id', '=', this.db.raw('(SELECT id FROM roles WHERE name = ?)', ['Admin']))
            .andWhereNot('users.is_service', true)
            .select('users.id', 'users.name', 'users.username', 'users.email', 'users.image_url');
        return admins.map(rowToAdminUser);
    }
}
exports.AccountStore = AccountStore;
//# sourceMappingURL=account-store.js.map