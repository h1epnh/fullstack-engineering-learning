"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetTokenStore = void 0;
const metrics_helper_1 = __importDefault(require("../util/metrics-helper"));
const metric_events_1 = require("../metric-events");
const notfound_error_1 = __importDefault(require("../error/notfound-error"));
const TABLE = 'reset_tokens';
const rowToResetToken = (row) => ({
    userId: row.user_id,
    token: row.reset_token,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    createdBy: row.created_by,
    usedAt: row.used_at,
});
class ResetTokenStore {
    constructor(db, eventBus, getLogger) {
        this.db = db;
        this.logger = getLogger('db/reset-token-store.ts');
        this.timer = (action) => metrics_helper_1.default.wrapTimer(eventBus, metric_events_1.DB_TIME, {
            store: 'reset-tokens',
            action,
        });
    }
    async getActive(token) {
        const row = await this.db(TABLE)
            .where({ reset_token: token })
            .where('expires_at', '>', new Date())
            .first();
        if (!row) {
            throw new notfound_error_1.default('Could not find an active token');
        }
        return rowToResetToken(row);
    }
    async getActiveTokens() {
        const rows = await this.db(TABLE)
            .whereNull('used_at')
            .andWhere('expires_at', '>', new Date());
        return rows.map(rowToResetToken);
    }
    async insert(newToken) {
        const [row] = await this.db(TABLE)
            .insert(newToken)
            .returning(['created_at']);
        return {
            userId: newToken.user_id,
            token: newToken.reset_token,
            expiresAt: newToken.expires_at,
            createdAt: row.created_at,
            createdBy: newToken.created_by,
        };
    }
    async useToken(token) {
        try {
            await this.db(TABLE)
                .update({ used_at: new Date() })
                .where({ reset_token: token.token, user_id: token.userId });
            return true;
        }
        catch (e) {
            return false;
        }
    }
    async deleteFromQuery({ reset_token }) {
        return this.db(TABLE).where(reset_token).del();
    }
    async deleteAll() {
        return this.db(TABLE).del();
    }
    async deleteExpired() {
        return this.db(TABLE).where('expires_at', '<', new Date()).del();
    }
    async expireExistingTokensForUser(user_id) {
        await this.db(TABLE).where({ user_id }).update({
            expires_at: new Date(),
        });
    }
    async delete(reset_token) {
        await this.db(TABLE).where({ reset_token }).del();
    }
    destroy() { }
    async exists(reset_token) {
        const result = await this.db.raw(`SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE reset_token = ?) AS present`, [reset_token]);
        const { present } = result.rows[0];
        return present;
    }
    async get(key) {
        const row = await this.db(TABLE).where({ reset_token: key }).first();
        return rowToResetToken(row);
    }
    async getAll() {
        const rows = await this.db(TABLE).select();
        return rows.map(rowToResetToken);
    }
}
exports.ResetTokenStore = ResetTokenStore;
//# sourceMappingURL=reset-token-store.js.map