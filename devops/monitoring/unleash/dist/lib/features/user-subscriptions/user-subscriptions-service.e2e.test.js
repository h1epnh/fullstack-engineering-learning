"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../types");
const database_init_1 = __importDefault(require("../../../test/e2e/helpers/database-init"));
const test_config_1 = require("../../../test/config/test-config");
const no_logger_1 = __importDefault(require("../../../test/fixtures/no-logger"));
const createUserSubscriptionsService_1 = require("./createUserSubscriptionsService");
let stores;
let db;
let userStore;
let userSubscriptionService;
let userSubscriptionsReadModel;
let eventsStore;
let config;
beforeAll(async () => {
    db = await (0, database_init_1.default)('user_subscriptions', no_logger_1.default);
    stores = db.stores;
    config = (0, test_config_1.createTestConfig)({});
    userStore = stores.userStore;
    userSubscriptionService = (0, createUserSubscriptionsService_1.createUserSubscriptionsService)(config)(db.rawDatabase);
    userSubscriptionsReadModel = db.stores.userSubscriptionsReadModel;
    eventsStore = db.stores.eventStore;
});
beforeEach(async () => {
    await userStore.deleteAll();
});
afterAll(async () => {
    await db.destroy();
});
test('Subscribe and unsubscribe', async () => {
    const user = await userStore.insert({
        email: 'test@getunleash.io',
        name: 'Sample Name',
    });
    await userStore.successfullyLogin(user);
    const subscribers = await userSubscriptionsReadModel.getSubscribedUsers('productivity-report');
    expect(subscribers).toMatchObject([
        { email: 'test@getunleash.io', name: 'Sample Name' },
    ]);
    const userSubscriptions = await userSubscriptionService.getUserSubscriptions(user.id);
    expect(userSubscriptions).toMatchObject(['productivity-report']);
    await userSubscriptionService.unsubscribe(user.id, 'productivity-report', types_1.TEST_AUDIT_USER);
    const noSubscribers = await userSubscriptionsReadModel.getSubscribedUsers('productivity-report');
    expect(noSubscribers).toMatchObject([]);
    const noUserSubscriptions = await userSubscriptionService.getUserSubscriptions(user.id);
    expect(noUserSubscriptions).toMatchObject([]);
});
test('Event log for subscription actions', async () => {
    const user = await userStore.insert({
        email: 'test@getunleash.io',
        name: 'Sample Name',
    });
    await userStore.successfullyLogin(user);
    await userSubscriptionService.unsubscribe(user.id, 'productivity-report', types_1.TEST_AUDIT_USER);
    const unsubscribeEvent = (await eventsStore.getAll())[0];
    expect(unsubscribeEvent).toEqual(expect.objectContaining({
        type: 'user-preference-updated',
        data: {
            subscription: 'productivity-report',
            action: 'unsubscribed',
        },
    }));
    await userSubscriptionService.subscribe(user.id, 'productivity-report', types_1.TEST_AUDIT_USER);
    const subscribeEvent = (await eventsStore.getAll())[0];
    expect(subscribeEvent).toEqual(expect.objectContaining({
        type: 'user-preference-updated',
        data: {
            subscription: 'productivity-report',
            action: 'subscribed',
        },
    }));
});
//# sourceMappingURL=user-subscriptions-service.e2e.test.js.map