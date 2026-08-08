"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const COLUMNS = ['given', 'user_id', 'feedback_id', 'nevershow'];
const TABLE = 'user_feedback';
const fieldToRow = (fields) => ({
    nevershow: fields.neverShow,
    feedback_id: fields.feedbackId,
    given: fields.given,
    user_id: fields.userId,
});
const rowToField = (row) => ({
    neverShow: row.nevershow || false,
    feedbackId: row.feedback_id,
    given: row.given,
    userId: row.user_id,
});
class UserFeedbackStore {
    constructor(db, eventBus, getLogger) {
        this.db = db;
        this.logger = getLogger('user-feedback-store.ts');
    }
    async getAllUserFeedback(userId) {
        const userFeedback = await this.db
            .table(TABLE)
            .select()
            .where({ user_id: userId });
        return userFeedback.map(rowToField);
    }
    async getFeedback(userId, feedbackId) {
        const userFeedback = await this.db
            .table(TABLE)
            .select()
            .where({ user_id: userId, feedback_id: feedbackId })
            .first();
        return rowToField(userFeedback);
    }
    async updateFeedback(feedback) {
        const insertedFeedback = await this.db
            .table(TABLE)
            .insert(fieldToRow(feedback))
            .onConflict(['user_id', 'feedback_id'])
            .merge()
            .returning(COLUMNS);
        return rowToField(insertedFeedback[0]);
    }
    async delete({ userId, feedbackId }) {
        await this.db(TABLE)
            .where({ user_id: userId, feedback_id: feedbackId })
            .del();
    }
    async deleteAll() {
        await this.db(TABLE).del();
    }
    destroy() { }
    async exists({ userId, feedbackId }) {
        const result = await this.db.raw(`SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE user_id = ? AND feedback_id = ?) AS present`, [userId, feedbackId]);
        const { present } = result.rows[0];
        return present;
    }
    async get({ userId, feedbackId, }) {
        return this.getFeedback(userId, feedbackId);
    }
    async getAll() {
        const userFeedbacks = await this.db
            .table(TABLE)
            .select();
        return userFeedbacks.map(rowToField);
    }
}
exports.default = UserFeedbackStore;
module.exports = UserFeedbackStore;
//# sourceMappingURL=user-feedback-store.js.map