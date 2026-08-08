"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeProjectLifecycleSummaryReadModel = void 0;
class FakeProjectLifecycleSummaryReadModel {
    async getProjectLifecycleSummary() {
        const placeholderData = {
            averageDays: 0,
            currentFlags: 0,
        };
        return {
            initial: placeholderData,
            preLive: placeholderData,
            live: placeholderData,
            completed: placeholderData,
            archived: {
                currentFlags: 0,
                last30Days: 0,
            },
        };
    }
}
exports.FakeProjectLifecycleSummaryReadModel = FakeProjectLifecycleSummaryReadModel;
//# sourceMappingURL=fake-project-lifecycle-summary-read-model.js.map