"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const COLUMNS = ['user_id', 'splash_id', 'seen'];
const TABLE = 'user_splash';
const fieldToRow = (fields) => ({
    seen: fields.seen,
    splash_id: fields.splashId,
    user_id: fields.userId,
});
const rowToField = (row) => ({
    seen: row.seen || false,
    splashId: row.splash_id,
    userId: row.user_id,
});
class UserSplashStore {
    constructor(db, eventBus, getLogger) {
        this.db = db;
        this.logger = getLogger('user-splash-store.ts');
    }
    async getAllUserSplashes(userId) {
        const userSplash = await this.db
            .table(TABLE)
            .select()
            .where({ user_id: userId });
        return userSplash.map(rowToField);
    }
    async getSplash(userId, splashId) {
        const userSplash = await this.db
            .table(TABLE)
            .select()
            .where({ user_id: userId, splash_id: splashId })
            .first();
        return rowToField(userSplash);
    }
    async updateSplash(splash) {
        const insertedSplash = await this.db
            .table(TABLE)
            .insert(fieldToRow(splash))
            .onConflict(['user_id', 'splash_id'])
            .merge()
            .returning(COLUMNS);
        return rowToField(insertedSplash[0]);
    }
    async delete({ userId, splashId }) {
        await this.db(TABLE)
            .where({ user_id: userId, splash_id: splashId })
            .del();
    }
    async deleteAll() {
        await this.db(TABLE).del();
    }
    destroy() { }
    async exists({ userId, splashId }) {
        const result = await this.db.raw(`SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE user_id = ? AND splash_id = ?) AS present`, [userId, splashId]);
        const { present } = result.rows[0];
        return present;
    }
    async get({ userId, splashId }) {
        return this.getSplash(userId, splashId);
    }
    async getAll() {
        const userSplashs = await this.db
            .table(TABLE)
            .select();
        return userSplashs.map(rowToField);
    }
}
exports.default = UserSplashStore;
module.exports = UserSplashStore;
//# sourceMappingURL=user-splash-store.js.map