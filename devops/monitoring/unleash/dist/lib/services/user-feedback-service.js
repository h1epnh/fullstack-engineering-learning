"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserFeedbackService {
    constructor({ userFeedbackStore }, { getLogger }) {
        this.userFeedbackStore = userFeedbackStore;
        this.logger = getLogger('services/user-feedback-service.js');
    }
    async getAllUserFeedback(user) {
        if (user.isAPI) {
            return [];
        }
        try {
            return await this.userFeedbackStore.getAllUserFeedback(user.id);
        }
        catch (err) {
            this.logger.error('Cannot read user feedback', err);
            return [];
        }
    }
    async getFeedback(user_id, feedback_id) {
        return this.userFeedbackStore.getFeedback(user_id, feedback_id);
    }
    async updateFeedback(feedback) {
        return this.userFeedbackStore.updateFeedback(feedback);
    }
}
exports.default = UserFeedbackService;
module.exports = UserFeedbackService;
//# sourceMappingURL=user-feedback-service.js.map