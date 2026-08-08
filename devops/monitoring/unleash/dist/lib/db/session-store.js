"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notfound_error_1 = __importDefault(require("../error/notfound-error"));
const date_fns_1 = require("date-fns");
const TABLE = 'unleash_session';
class SessionStore {
    constructor(db, eventBus, getLogger) {
        this.db = db;
        this.eventBus = eventBus;
        this.logger = getLogger('lib/db/session-store.ts');
    }
    async getActiveSessions() {
        const rows = await this.db(TABLE)
            .whereNull('expired')
            .orWhere('expired', '>', new Date())
            .orderBy('created_at', 'desc');
        return rows.map(this.rowToSession);
    }
    async getSessionsForUser(userId) {
        const rows = await this.db(TABLE).whereRaw("(sess -> 'user' ->> 'id')::int = ?", [userId]);
        if (rows && rows.length > 0) {
            return rows.map(this.rowToSession);
        }
        return [];
    }
    async get(sid) {
        const row = await this.db(TABLE)
            .where('sid', '=', sid)
            .first();
        if (row) {
            return this.rowToSession(row);
        }
        throw new notfound_error_1.default(`Could not find session with sid ${sid}`);
    }
    async deleteSessionsForUser(userId) {
        await this.db(TABLE)
            .whereRaw("(sess -> 'user' ->> 'id')::int = ?", [userId])
            .del();
    }
    async delete(sid) {
        await this.db(TABLE).where('sid', '=', sid).del();
    }
    async insertSession(data) {
        const row = await this.db(TABLE)
            .insert({
            sid: data.sid,
            sess: JSON.stringify(data.sess),
            expired: data.expired || (0, date_fns_1.addDays)(Date.now(), 1),
        })
            .returning(['sid', 'sess', 'created_at', 'expired']);
        if (row) {
            return this.rowToSession(row);
        }
        throw new Error('Could not insert session');
    }
    async deleteAll() {
        await this.db(TABLE).del();
    }
    destroy() { }
    async exists(sid) {
        const result = await this.db.raw(`SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE sid = ?) AS present`, [sid]);
        const { present } = result.rows[0];
        return present;
    }
    async getAll() {
        const rows = await this.db(TABLE);
        return rows.map(this.rowToSession);
    }
    rowToSession(row) {
        return {
            sid: row.sid,
            sess: row.sess,
            createdAt: row.created_at,
            expired: row.expired,
        };
    }
    async getSessionsCount() {
        const rows = await this.db(TABLE)
            .select(this.db.raw("sess->'user'->>'id' AS user_id"))
            .count('* as count')
            .groupBy('user_id');
        return rows.map((row) => ({
            userId: Number(row.user_id),
            count: Number(row.count),
        }));
    }
    async getMaxSessionsCount() {
        const result = await this.db(TABLE)
            .select(this.db.raw("sess->'user'->>'id' AS user_id"))
            .count('* as count')
            .groupBy('user_id')
            .orderBy('count', 'desc')
            .first();
        return result ? Number(result.count) : 0;
    }
}
exports.default = SessionStore;
module.exports = SessionStore;
//# sourceMappingURL=session-store.js.map