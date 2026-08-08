"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeInactiveUsersService = exports.createInactiveUsersService = void 0;
const inactive_users_service_1 = require("./inactive-users-service");
const inactive_users_store_1 = require("./inactive-users-store");
const fake_inactive_users_store_1 = require("./fakes/fake-inactive-users-store");
const createInactiveUsersService = (db, config, userService) => {
    const { eventBus, getLogger, userInactivityThresholdInDays } = config;
    const inactiveUsersStore = new inactive_users_store_1.InactiveUsersStore(db, eventBus, getLogger);
    return new inactive_users_service_1.InactiveUsersService({ inactiveUsersStore }, { getLogger, userInactivityThresholdInDays }, { userService });
};
exports.createInactiveUsersService = createInactiveUsersService;
const createFakeInactiveUsersService = ({ getLogger, userInactivityThresholdInDays, }, userService) => {
    const fakeStore = new fake_inactive_users_store_1.FakeInactiveUsersStore();
    return new inactive_users_service_1.InactiveUsersService({ inactiveUsersStore: fakeStore }, { getLogger, userInactivityThresholdInDays }, { userService });
};
exports.createFakeInactiveUsersService = createFakeInactiveUsersService;
//# sourceMappingURL=createInactiveUsersService.js.map