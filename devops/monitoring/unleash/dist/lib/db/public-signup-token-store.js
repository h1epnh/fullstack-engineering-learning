"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicSignupTokenStore = void 0;
const metrics_helper_1 = __importDefault(require("../util/metrics-helper"));
const metric_events_1 = require("../metric-events");
const notfound_error_1 = __importDefault(require("../error/notfound-error"));
const TABLE = 'public_signup_tokens';
const TOKEN_USERS_TABLE = 'public_signup_tokens_user';
const tokenRowReducer = (acc, tokenRow) => {
    const { userId, userName, userUsername, roleId, roleName, roleType, ...token } = tokenRow;
    if (!acc[tokenRow.secret]) {
        acc[tokenRow.secret] = {
            secret: token.secret,
            name: token.name,
            url: token.url,
            expiresAt: token.expires_at,
            enabled: token.enabled,
            createdAt: token.created_at,
            createdBy: token.created_by,
            role: {
                id: roleId,
                name: roleName,
                type: roleType,
            },
            users: [],
        };
    }
    const currentToken = acc[tokenRow.secret];
    if (userId) {
        currentToken.users.push({
            id: userId,
            name: userName,
            username: userUsername,
        });
    }
    return acc;
};
const toRow = (newToken) => {
    if (!newToken)
        return;
    return {
        secret: newToken.secret,
        name: newToken.name,
        expires_at: newToken.expiresAt,
        created_by: newToken.createdBy || null,
        role_id: newToken.roleId,
        url: newToken.url,
    };
};
const toTokens = (rows) => {
    const tokens = rows.reduce(tokenRowReducer, {});
    return Object.values(tokens);
};
class PublicSignupTokenStore {
    constructor(db, eventBus, getLogger) {
        this.db = db;
        this.logger = getLogger('public-signup-tokens.js');
        this.timer = (action) => metrics_helper_1.default.wrapTimer(eventBus, metric_events_1.DB_TIME, {
            store: 'public-signup-tokens',
            action,
        });
    }
    count() {
        return this.db(TABLE)
            .count('*')
            .then((res) => Number(res[0].count));
    }
    makeTokenUsersQuery() {
        return this.db(`${TABLE} as tokens`)
            .leftJoin(`${TOKEN_USERS_TABLE} as token_project_users`, 'tokens.secret', 'token_project_users.secret')
            .leftJoin(`users`, 'token_project_users.user_id', 'users.id')
            .leftJoin(`roles`, 'tokens.role_id', 'roles.id')
            .select('tokens.secret', 'tokens.name', 'tokens.expires_at', 'tokens.enabled', 'tokens.created_at', 'tokens.created_by', 'tokens.url', 'token_project_users.user_id as userId', 'users.name as userName', 'users.username as userUsername', 'roles.id as roleId', 'roles.name as roleName', 'roles.type as roleType');
    }
    async getAll() {
        const stopTimer = this.timer('getAll');
        const rows = await this.makeTokenUsersQuery();
        stopTimer();
        return toTokens(rows);
    }
    async addTokenUser(secret, userId) {
        await this.db(TOKEN_USERS_TABLE).insert({ user_id: userId, secret }, ['created_at']);
    }
    async insert(newToken) {
        const response = await this.db(TABLE).insert(
        // @ts-expect-error - knex expects us to return a DbRecordArr<OurType>, we return OurType, which works fine.
        toRow(newToken), ['secret']);
        return this.get(response[0].secret);
    }
    async isValid(secret) {
        const result = await this.db.raw(`SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE secret = ? AND expires_at::date > ? AND enabled = true) AS valid`, [secret, new Date()]);
        const { valid } = result.rows[0];
        return valid;
    }
    destroy() { }
    async exists(secret) {
        const result = await this.db.raw(`SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE secret = ?) AS present`, [secret]);
        const { present } = result.rows[0];
        return present;
    }
    async get(key) {
        const rows = await this.makeTokenUsersQuery().where('tokens.secret', key);
        if (rows.length > 0) {
            return toTokens(rows)[0];
        }
        throw new notfound_error_1.default('Could not find public signup token.');
    }
    async delete(secret) {
        return this.db(TABLE).where({ secret }).del();
    }
    async deleteAll() {
        return this.db(TABLE).del();
    }
    async update(secret, { expiresAt, enabled }) {
        const rows = await this.makeTokenUsersQuery()
            .update({ expires_at: expiresAt, enabled })
            .where('secret', secret)
            .returning('*');
        if (rows.length > 0) {
            return toTokens(rows)[0];
        }
        throw new notfound_error_1.default('Could not find public signup token.');
    }
}
exports.PublicSignupTokenStore = PublicSignupTokenStore;
//# sourceMappingURL=public-signup-token-store.js.map