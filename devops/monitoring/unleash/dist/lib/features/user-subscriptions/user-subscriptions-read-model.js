"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSubscriptionsReadModel = void 0;
const user_subscriptions_read_model_type_1 = require("./user-subscriptions-read-model-type");
const USERS_TABLE = 'users';
const USER_COLUMNS = [
    'id',
    'name',
    'username',
    'email',
    'image_url',
    'is_service',
];
const UNSUBSCRIPTION_TABLE = 'user_unsubscription';
const mapRowToSubscriber = (row) => ({
    name: row.name || row.username || '',
    email: row.email,
});
class UserSubscriptionsReadModel {
    constructor(db) {
        this.db = db;
    }
    async getSubscribedUsers(subscription) {
        const unsubscribedUserIdsQuery = this.db(UNSUBSCRIPTION_TABLE)
            .select('user_id')
            .where('subscription', subscription);
        const users = await this.db(USERS_TABLE)
            .select(USER_COLUMNS)
            .whereNotIn('id', unsubscribedUserIdsQuery)
            .andWhere('is_service', false)
            .andWhere('deleted_at', null)
            .andWhereNot('seen_at', null)
            .andWhereNot('email', null);
        return users.map(mapRowToSubscriber);
    }
    async getUnsubscribedUsers(subscription) {
        const unsubscribedUserIdsQuery = this.db(UNSUBSCRIPTION_TABLE)
            .select('user_id')
            .where('subscription', subscription);
        const users = await this.db(USERS_TABLE)
            .select(USER_COLUMNS)
            .whereIn('id', unsubscribedUserIdsQuery)
            .andWhere('is_service', false)
            .andWhere('deleted_at', null)
            .andWhereNot('email', null);
        return users.map(mapRowToSubscriber);
    }
    async getUserSubscriptions(userId) {
        const unsubscriptionsList = await this.db(UNSUBSCRIPTION_TABLE)
            .select('subscription')
            .where('user_id', userId);
        const unsubscriptions = unsubscriptionsList.map((item) => item.subscription);
        return user_subscriptions_read_model_type_1.SUBSCRIPTION_TYPES.filter((subscription) => !unsubscriptions.includes(subscription));
    }
}
exports.UserSubscriptionsReadModel = UserSubscriptionsReadModel;
//# sourceMappingURL=user-subscriptions-read-model.js.map