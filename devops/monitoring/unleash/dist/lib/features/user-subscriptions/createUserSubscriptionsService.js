"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeUserSubscriptionsService = exports.createUserSubscriptionsService = void 0;
const user_subscriptions_service_1 = require("./user-subscriptions-service");
const user_unsubscribe_store_1 = require("./user-unsubscribe-store");
const createEventsService_1 = require("../events/createEventsService");
const fake_user_unsubscribe_store_1 = require("./fake-user-unsubscribe-store");
const user_subscriptions_read_model_1 = require("./user-subscriptions-read-model");
const fake_user_subscriptions_read_model_1 = require("./fake-user-subscriptions-read-model");
const createUserSubscriptionsService = (config) => (db) => {
    const userUnsubscribeStore = new user_unsubscribe_store_1.UserUnsubscribeStore(db);
    const userSubscriptionsReadModel = new user_subscriptions_read_model_1.UserSubscriptionsReadModel(db);
    const eventService = (0, createEventsService_1.createEventsService)(db, config);
    const userSubscriptionsService = new user_subscriptions_service_1.UserSubscriptionsService({ userUnsubscribeStore, userSubscriptionsReadModel }, config, eventService);
    return userSubscriptionsService;
};
exports.createUserSubscriptionsService = createUserSubscriptionsService;
const createFakeUserSubscriptionsService = (config) => {
    const userUnsubscribeStore = new fake_user_unsubscribe_store_1.FakeUserUnsubscribeStore();
    const userSubscriptionsReadModel = new fake_user_subscriptions_read_model_1.FakeUserSubscriptionsReadModel();
    const eventService = (0, createEventsService_1.createFakeEventsService)(config);
    const userSubscriptionsService = new user_subscriptions_service_1.UserSubscriptionsService({ userUnsubscribeStore, userSubscriptionsReadModel }, config, eventService);
    return userSubscriptionsService;
};
exports.createFakeUserSubscriptionsService = createFakeUserSubscriptionsService;
//# sourceMappingURL=createUserSubscriptionsService.js.map