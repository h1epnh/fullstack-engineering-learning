"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const setting_service_1 = __importDefault(require("../../../lib/services/setting-service"));
const test_config_1 = require("../../config/test-config");
const database_init_1 = __importDefault(require("../helpers/database-init"));
const events_1 = require("../../../lib/types/events");
const types_1 = require("../../../lib/types");
const features_1 = require("../../../lib/features");
let stores;
let db;
let service;
const TEST_USER_ID = -9999;
beforeAll(async () => {
    const config = (0, test_config_1.createTestConfig)();
    db = await (0, database_init_1.default)('setting_service_serial', config.getLogger);
    stores = db.stores;
    const eventService = (0, features_1.createEventsService)(db.rawDatabase, config);
    service = new setting_service_1.default(stores, config, eventService);
});
beforeEach(async () => {
    await stores.eventStore.deleteAll();
});
afterAll(async () => {
    await db.destroy();
});
test('Can create new setting', async () => {
    const someData = { some: 'blob' };
    await service.insert('some-setting', someData, types_1.TEST_AUDIT_USER, false);
    const actual = await service.get('some-setting');
    expect(actual).toStrictEqual(someData);
    const { eventStore } = stores;
    const createdEvents = await eventStore.deprecatedSearchEvents({
        type: events_1.SETTING_CREATED,
    });
    expect(createdEvents).toHaveLength(1);
    expect(createdEvents[0].data).toEqual({ id: 'some-setting', some: 'blob' });
});
test('Can delete setting', async () => {
    const someData = { some: 'blob' };
    await service.insert('some-setting', someData, types_1.TEST_AUDIT_USER);
    await service.delete('some-setting', types_1.TEST_AUDIT_USER);
    const actual = await service.get('some-setting');
    expect(actual).toBeUndefined();
    const { eventStore } = stores;
    const createdEvents = await eventStore.deprecatedSearchEvents({
        type: events_1.SETTING_DELETED,
    });
    expect(createdEvents).toHaveLength(1);
});
test('Sentitive SSO settings are redacted in event log', async () => {
    const someData = { password: 'mySecretPassword' };
    const property = 'unleash.enterprise.auth.oidc';
    await service.insert(property, someData, types_1.TEST_AUDIT_USER);
    await service.insert(property, { password: 'changed' }, types_1.TEST_AUDIT_USER);
    const actual = await service.get(property);
    const { eventStore } = stores;
    const updatedEvents = await eventStore.deprecatedSearchEvents({
        type: events_1.SETTING_UPDATED,
    });
    expect(updatedEvents[0].preData).toEqual({ hideEventDetails: true });
    await service.delete(property, types_1.TEST_AUDIT_USER);
});
test('Can update setting', async () => {
    const { eventStore } = stores;
    const someData = { some: 'blob' };
    await service.insert('updated-setting', someData, types_1.TEST_AUDIT_USER, false);
    await service.insert('updated-setting', { ...someData, test: 'fun' }, types_1.TEST_AUDIT_USER, false);
    const updatedEvents = await eventStore.deprecatedSearchEvents({
        type: events_1.SETTING_UPDATED,
    });
    expect(updatedEvents).toHaveLength(1);
    expect(updatedEvents[0].data).toEqual({
        id: 'updated-setting',
        some: 'blob',
        test: 'fun',
    });
});
//# sourceMappingURL=setting-service.test.js.map