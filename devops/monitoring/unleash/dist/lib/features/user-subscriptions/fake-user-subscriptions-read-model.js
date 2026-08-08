"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeUserSubscriptionsReadModel = void 0;
class FakeUserSubscriptionsReadModel {
    async getSubscribedUsers(subscription) {
        return [];
    }
    async getUnsubscribedUsers(subscription) {
        return [];
    }
    async getUserSubscriptions() {
        return ['productivity-report'];
    }
}
exports.FakeUserSubscriptionsReadModel = FakeUserSubscriptionsReadModel;
//# sourceMappingURL=fake-user-subscriptions-read-model.js.map