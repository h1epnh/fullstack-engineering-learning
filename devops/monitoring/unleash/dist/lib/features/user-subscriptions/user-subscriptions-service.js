"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSubscriptionsService = void 0;
const types_1 = require("../../types");
class UserSubscriptionsService {
    constructor({ userUnsubscribeStore, userSubscriptionsReadModel, }, { getLogger }, eventService) {
        this.userUnsubscribeStore = userUnsubscribeStore;
        this.userSubscriptionsReadModel = userSubscriptionsReadModel;
        this.eventService = eventService;
        this.logger = getLogger('services/user-subscription-service.ts');
    }
    async getUserSubscriptions(userId) {
        return this.userSubscriptionsReadModel.getUserSubscriptions(userId);
    }
    async subscribe(userId, subscription, auditUser) {
        const entry = {
            userId,
            subscription,
        };
        await this.userUnsubscribeStore.delete(entry);
        await this.eventService.storeEvent(new types_1.UserPreferenceUpdatedEvent({
            userId,
            data: { subscription, action: 'subscribed' },
            auditUser,
        }));
    }
    async unsubscribe(userId, subscription, auditUser) {
        const entry = {
            userId,
            subscription,
        };
        await this.userUnsubscribeStore.insert(entry);
        await this.eventService.storeEvent(new types_1.UserPreferenceUpdatedEvent({
            userId,
            data: { subscription, action: 'unsubscribed' },
            auditUser,
        }));
    }
}
exports.UserSubscriptionsService = UserSubscriptionsService;
//# sourceMappingURL=user-subscriptions-service.js.map