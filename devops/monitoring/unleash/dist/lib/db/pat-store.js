"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notfound_error_1 = __importDefault(require("../error/notfound-error"));
const TABLE = 'personal_access_tokens';
const PAT_PUBLIC_COLUMNS = [
    'id',
    'description',
    'user_id',
    'expires_at',
    'created_at',
    'seen_at',
];
const rowToPat = ({ id, description, expires_at, user_id, created_at, seen_at, }) => ({
    id,
    description,
    expiresAt: expires_at,
    userId: user_id,
    createdAt: created_at,
    seenAt: seen_at,
});
const patToRow = ({ description, expiresAt }) => ({
    description,
    expires_at: expiresAt,
});
class PatStore {
    constructor(db, getLogger) {
        this.db = db;
        this.logger = getLogger('pat-store.ts');
    }
    async create(pat, secret, userId) {
        const rows = await this.db(TABLE)
            .insert({ ...patToRow(pat), secret, user_id: userId })
            .returning('*');
        return rowToPat(rows[0]);
    }
    async delete(id) {
        return this.db(TABLE).where({ id: id }).del();
    }
    async deleteForUser(id, userId) {
        return this.db(TABLE).where({ id: id, user_id: userId }).del();
    }
    async deleteAll() {
        await this.db(TABLE).del();
    }
    destroy() { }
    async exists(id) {
        const result = await this.db.raw(`SELECT EXISTS(SELECT 1 FROM ${TABLE} WHERE id = ?) AS present`, [id]);
        const { present } = result.rows[0];
        return present;
    }
    async existsWithDescriptionByUser(description, userId) {
        const result = await this.db.raw(`SELECT EXISTS(SELECT 1 FROM ${TABLE} WHERE description = ? AND user_id = ?) AS present`, [description, userId]);
        const { present } = result.rows[0];
        return present;
    }
    async countByUser(userId) {
        const result = await this.db.raw(`SELECT COUNT(*) AS count FROM ${TABLE} WHERE user_id = ?`, [userId]);
        const { count } = result.rows[0];
        return count;
    }
    async get(id) {
        const row = await this.db(TABLE).where({ id }).first();
        if (!row) {
            throw new notfound_error_1.default('No PAT found.');
        }
        return rowToPat(row);
    }
    async getAll() {
        const pats = await this.db.select(PAT_PUBLIC_COLUMNS).from(TABLE);
        return pats.map(rowToPat);
    }
    async getAllByUser(userId) {
        const pats = await this.db
            .select(PAT_PUBLIC_COLUMNS)
            .from(TABLE)
            .where('user_id', userId);
        return pats.map(rowToPat);
    }
}
exports.default = PatStore;
//# sourceMappingURL=pat-store.js.map