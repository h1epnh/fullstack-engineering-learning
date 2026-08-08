"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeAccessService = exports.createAccessService = void 0;
const group_store_1 = __importDefault(require("../../db/group-store"));
const account_store_1 = require("../../db/account-store");
const role_store_1 = __importDefault(require("../../db/role-store"));
const environment_store_1 = __importDefault(require("../project-environments/environment-store"));
const access_store_1 = require("../../db/access-store");
const services_1 = require("../../services");
const fake_group_store_1 = __importDefault(require("../../../test/fixtures/fake-group-store"));
const fake_event_store_1 = __importDefault(require("../../../test/fixtures/fake-event-store"));
const fake_account_store_1 = require("../../../test/fixtures/fake-account-store");
const fake_role_store_1 = __importDefault(require("../../../test/fixtures/fake-role-store"));
const fake_environment_store_1 = __importDefault(require("../project-environments/fake-environment-store"));
const fake_access_store_1 = __importDefault(require("../../../test/fixtures/fake-access-store"));
const createEventsService_1 = require("../events/createEventsService");
const createAccessService = (db, config) => {
    const { eventBus, getLogger } = config;
    const groupStore = new group_store_1.default(db);
    const accountStore = new account_store_1.AccountStore(db, getLogger);
    const roleStore = new role_store_1.default(db, eventBus, getLogger);
    const environmentStore = new environment_store_1.default(db, eventBus, config);
    const accessStore = new access_store_1.AccessStore(db, eventBus, getLogger);
    const eventService = (0, createEventsService_1.createEventsService)(db, config);
    const groupService = new services_1.GroupService({ groupStore, accountStore }, { getLogger }, eventService);
    return new services_1.AccessService({ accessStore, accountStore, roleStore, environmentStore }, { getLogger }, groupService, eventService);
};
exports.createAccessService = createAccessService;
const createFakeAccessService = (config) => {
    const { getLogger } = config;
    const eventStore = new fake_event_store_1.default();
    const groupStore = new fake_group_store_1.default();
    const accountStore = new fake_account_store_1.FakeAccountStore();
    const roleStore = new fake_role_store_1.default();
    const environmentStore = new fake_environment_store_1.default();
    const accessStore = new fake_access_store_1.default(roleStore);
    const eventService = (0, createEventsService_1.createFakeEventsService)(config, { eventStore });
    const groupService = new services_1.GroupService({ groupStore, accountStore }, { getLogger }, eventService);
    const accessService = new services_1.AccessService({ accessStore, accountStore, roleStore, environmentStore, groupStore }, { getLogger }, groupService, eventService);
    return {
        accessService,
        eventStore,
        accessStore,
        roleStore,
    };
};
exports.createFakeAccessService = createFakeAccessService;
//# sourceMappingURL=createAccessService.js.map