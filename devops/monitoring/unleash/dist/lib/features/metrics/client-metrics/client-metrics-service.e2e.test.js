"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const instance_service_1 = __importDefault(require("../instance/instance-service"));
const date_fns_1 = require("date-fns");
const test_config_1 = require("../../../../test/config/test-config");
const types_1 = require("../../../types");
const fakePrivateProjectChecker_1 = require("../../private-project/fakePrivateProjectChecker");
const database_init_1 = __importDefault(require("../../../../test/e2e/helpers/database-init"));
const no_logger_1 = require("../../../../test/fixtures/no-logger");
const faker_1 = __importDefault(require("faker"));
let stores;
let db;
let clientInstanceService;
let config;
beforeAll(async () => {
    db = await (0, database_init_1.default)('client_metrics_service_serial', no_logger_1.noLoggerProvider);
    stores = db.stores;
    config = (0, test_config_1.createTestConfig)({});
    const bulkInterval = (0, date_fns_1.secondsToMilliseconds)(0.5);
    const announcementInterval = (0, date_fns_1.secondsToMilliseconds)(2);
    clientInstanceService = new instance_service_1.default(stores, config, new fakePrivateProjectChecker_1.FakePrivateProjectChecker());
});
afterAll(async () => {
    await db.destroy();
});
test('Apps registered should be announced', async () => {
    expect.assertions(3);
    const clientRegistration = {
        appName: faker_1.default.internet.domainName(),
        instanceId: faker_1.default.datatype.uuid(),
        strategies: ['default'],
        started: Date.now(),
        interval: faker_1.default.datatype.number(),
        icon: '',
        description: faker_1.default.company.catchPhrase(),
        color: faker_1.default.internet.color(),
    };
    const differentClient = {
        appName: faker_1.default.datatype.uuid(),
        instanceId: faker_1.default.datatype.uuid(),
        strategies: ['default'],
        started: Date.now(),
        interval: faker_1.default.datatype.number(),
        icon: '',
        description: faker_1.default.company.catchPhrase(),
        color: faker_1.default.internet.color(),
    };
    await clientInstanceService.registerClient(clientRegistration, '127.0.0.1');
    await clientInstanceService.registerClient(differentClient, '127.0.0.1');
    await clientInstanceService.bulkAdd(); // in prod called by a SchedulerService
    const first = await stores.clientApplicationsStore.getUnannounced();
    expect(first.length).toBe(2);
    await clientInstanceService.registerClient(clientRegistration, '127.0.0.1');
    await clientInstanceService.announceUnannounced(); // in prod called by a SchedulerService
    const second = await stores.clientApplicationsStore.getUnannounced();
    expect(second.length).toBe(0);
    const events = await stores.eventStore.getEvents();
    const appCreatedEvents = events.filter((e) => e.type === types_1.APPLICATION_CREATED);
    expect(appCreatedEvents.length).toBe(2);
});
//# sourceMappingURL=client-metrics-service.e2e.test.js.map