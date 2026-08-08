"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const not_implemented_error_1 = __importDefault(require("../../lib/error/not-implemented-error"));
class FakeUserFeedbackStore {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    delete(key) {
        return Promise.resolve(undefined);
    }
    deleteAll() {
        return Promise.resolve(undefined);
    }
    destroy() { }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    exists(key) {
        return Promise.resolve(false);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    get(key) {
        throw new not_implemented_error_1.default('This is not implemented yet');
    }
    getAll() {
        return Promise.resolve([]);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAllUserFeedback(userId) {
        return Promise.resolve([]);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getFeedback(userId, feedbackId) {
        throw new not_implemented_error_1.default('This is not implemented yet');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateFeedback(feedback) {
        throw new not_implemented_error_1.default('This is not implemented yet');
    }
}
exports.default = FakeUserFeedbackStore;
//# sourceMappingURL=fake-user-feedback-store.js.map