"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../../test/e2e/helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../test/fixtures/no-logger"));
const user_subscriptions_read_model_1 = require("./user-subscriptions-read-model");
const user_subscriptions_read_model_type_1 = require("./user-subscriptions-read-model-type");
let db;
let stores;
let userStore;
let userUnsubscribeStore;
let userSubscriptionsReadModel;
const subscription = 'productivity-report';
beforeAll(async () => {
    db = await (0, database_init_1.default)('user_subscriptions_read_model_test', no_logger_1.default);
    stores = db.stores;
    userStore = stores.userStore;
    userUnsubscribeStore = stores.userUnsubscribeStore;
    userSubscriptionsReadModel = new user_subscriptions_read_model_1.UserSubscriptionsReadModel(db.rawDatabase);
});
beforeEach(async () => {
    await db.stores.userStore.deleteAll();
});
afterAll(async () => {
    await db.destroy();
});
describe('User subscription read model', () => {
    test('returns subscribed and unsubscribed users', async () => {
        const user1 = await userStore.insert({
            email: 'user1@example.com',
            name: 'User One',
        });
        // user seen
        await userStore.successfullyLogin(user1);
        const user2 = await userStore.insert({
            email: 'user2@example.com',
            name: 'User Two',
        });
        // never seen
        const user3 = await userStore.insert({
            email: 'user3@example.com',
            name: 'User Three',
        });
        // unsubscribe
        await userUnsubscribeStore.insert({
            userId: user2.id,
            subscription,
        });
        const subscribers = await userSubscriptionsReadModel.getSubscribedUsers(subscription);
        expect(subscribers).toHaveLength(1);
        expect(subscribers).toEqual(expect.arrayContaining([
            { email: 'user1@example.com', name: 'User One' },
        ]));
        const unsubscribers = await userSubscriptionsReadModel.getUnsubscribedUsers(subscription);
        expect(unsubscribers).toEqual(expect.arrayContaining([
            { email: 'user2@example.com', name: 'User Two' },
        ]));
    });
    test('reflects changes after unsubscribe and resubscribe', async () => {
        const user = await userStore.insert({
            email: 'user7@example.com',
            name: 'User Seven',
        });
        await userStore.successfullyLogin(user);
        let subscribers = await userSubscriptionsReadModel.getSubscribedUsers(subscription);
        expect(subscribers).toEqual(expect.arrayContaining([
            { email: 'user7@example.com', name: 'User Seven' },
        ]));
        await userUnsubscribeStore.insert({
            userId: user.id,
            subscription,
        });
        subscribers =
            await userSubscriptionsReadModel.getSubscribedUsers(subscription);
        expect(subscribers).not.toEqual(expect.arrayContaining([
            { email: 'user7@example.com', name: 'User Seven' },
        ]));
        await userUnsubscribeStore.delete({
            userId: user.id,
            subscription,
        });
        subscribers =
            await userSubscriptionsReadModel.getSubscribedUsers(subscription);
        expect(subscribers).toEqual(expect.arrayContaining([
            { email: 'user7@example.com', name: 'User Seven' },
        ]));
    });
    test('should not include deleted users', async () => {
        const user = await userStore.insert({
            email: 'todelete@getunleash.io',
            name: 'To Delete',
        });
        await userStore.delete(user.id);
        const subscribers = await userSubscriptionsReadModel.getSubscribedUsers(subscription);
        expect(subscribers).toHaveLength(0);
    });
});
describe('User subscription read model', () => {
    test('returns all user subscriptions if user has not unsubscribed', async () => {
        const user = await userStore.insert({
            email: 'user4@example.com',
            name: 'User Four',
        });
        const userSubscriptions = await userSubscriptionsReadModel.getUserSubscriptions(user.id);
        expect(userSubscriptions).toEqual(user_subscriptions_read_model_type_1.SUBSCRIPTION_TYPES);
    });
    test('returns correct subscriptions if user unsubscribed and resubscribed', async () => {
        const user = await userStore.insert({
            email: 'user5@example.com',
            name: 'User Five',
        });
        const subscription = 'productivity-report';
        await userUnsubscribeStore.insert({
            userId: user.id,
            subscription,
        });
        const userSubscriptions = await userSubscriptionsReadModel.getUserSubscriptions(user.id);
        expect(userSubscriptions).not.toContain(subscription);
        await userUnsubscribeStore.delete({
            userId: user.id,
            subscription,
        });
        const userSubscriptionsAfterResubscribe = await userSubscriptionsReadModel.getUserSubscriptions(user.id);
        expect(userSubscriptionsAfterResubscribe).toContain(subscription);
    });
});
//# sourceMappingURL=user-subscriptions-read-model.test.js.map