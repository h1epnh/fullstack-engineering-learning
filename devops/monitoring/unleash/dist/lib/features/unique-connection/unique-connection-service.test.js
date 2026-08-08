"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const unique_connection_service_1 = require("./unique-connection-service");
const fake_unique_connection_store_1 = require("./fake-unique-connection-store");
const no_logger_1 = __importDefault(require("../../../test/fixtures/no-logger"));
const metric_events_1 = require("../../metric-events");
const date_fns_1 = require("date-fns");
const events_1 = __importDefault(require("events"));
const unique_connection_read_model_1 = require("./unique-connection-read-model");
const alwaysOnFlagResolver = {
    isEnabled() {
        return true;
    },
};
test('sync first current bucket', async () => {
    const eventBus = new events_1.default();
    const config = { flagResolver: alwaysOnFlagResolver, getLogger: no_logger_1.default, eventBus };
    const uniqueConnectionStore = new fake_unique_connection_store_1.FakeUniqueConnectionStore();
    const uniqueConnectionService = new unique_connection_service_1.UniqueConnectionService({ uniqueConnectionStore }, config);
    const uniqueConnectionReadModel = new unique_connection_read_model_1.UniqueConnectionReadModel(uniqueConnectionStore);
    uniqueConnectionService.listen();
    eventBus.emit(metric_events_1.SDK_CONNECTION_ID_RECEIVED, {
        connectionId: 'connection1',
        type: 'backend',
    });
    eventBus.emit(metric_events_1.SDK_CONNECTION_ID_RECEIVED, {
        connectionId: 'connection1',
        type: 'backend',
    });
    eventBus.emit(metric_events_1.SDK_CONNECTION_ID_RECEIVED, {
        connectionId: 'connection2',
        type: 'backend',
    });
    eventBus.emit(metric_events_1.SDK_CONNECTION_ID_RECEIVED, {
        connectionId: 'connection2',
        type: 'backend',
    });
    eventBus.emit(metric_events_1.SDK_CONNECTION_ID_RECEIVED, {
        connectionId: 'connection2',
        type: 'backend',
    });
    await uniqueConnectionService.sync();
    const stats = await uniqueConnectionReadModel.getStats();
    expect(stats).toEqual({
        previous: 0,
        current: 2,
        previousBackend: 0,
        currentBackend: 2,
        previousFrontend: 0,
        currentFrontend: 0,
    });
});
test('sync first previous bucket', async () => {
    const eventBus = new events_1.default();
    const config = { flagResolver: alwaysOnFlagResolver, getLogger: no_logger_1.default, eventBus };
    const uniqueConnectionStore = new fake_unique_connection_store_1.FakeUniqueConnectionStore();
    const uniqueConnectionService = new unique_connection_service_1.UniqueConnectionService({ uniqueConnectionStore }, config);
    uniqueConnectionService.listen();
    const uniqueConnectionReadModel = new unique_connection_read_model_1.UniqueConnectionReadModel(uniqueConnectionStore);
    eventBus.emit(metric_events_1.SDK_CONNECTION_ID_RECEIVED, {
        connectionId: 'connection1',
        type: 'backend',
    });
    eventBus.emit(metric_events_1.SDK_CONNECTION_ID_RECEIVED, {
        connectionId: 'connection2',
        type: 'backend',
    });
    await uniqueConnectionService.sync();
    eventBus.emit(metric_events_1.SDK_CONNECTION_ID_RECEIVED, {
        connectionId: 'connection3',
        type: 'backend',
    });
    await uniqueConnectionService.sync((0, date_fns_1.addHours)(new Date(), 1));
    const stats = await uniqueConnectionReadModel.getStats();
    expect(stats).toEqual({
        previous: 3,
        current: 0,
        previousBackend: 3,
        currentBackend: 0,
        previousFrontend: 0,
        currentFrontend: 0,
    });
});
test('sync to existing current bucket from the same service', async () => {
    const eventBus = new events_1.default();
    const config = { flagResolver: alwaysOnFlagResolver, getLogger: no_logger_1.default, eventBus };
    const uniqueConnectionStore = new fake_unique_connection_store_1.FakeUniqueConnectionStore();
    const uniqueConnectionService = new unique_connection_service_1.UniqueConnectionService({ uniqueConnectionStore }, config);
    uniqueConnectionService.listen();
    const uniqueConnectionReadModel = new unique_connection_read_model_1.UniqueConnectionReadModel(uniqueConnectionStore);
    uniqueConnectionService.count({
        connectionId: 'connection1',
        type: 'backend',
    });
    uniqueConnectionService.count({
        connectionId: 'connection2',
        type: 'backend',
    });
    await uniqueConnectionService.sync();
    uniqueConnectionService.count({
        connectionId: 'connection1',
        type: 'backend',
    });
    uniqueConnectionService.count({
        connectionId: 'connection3',
        type: 'backend',
    });
    const stats = await uniqueConnectionReadModel.getStats();
    expect(stats).toEqual({
        previous: 0,
        current: 3,
        previousBackend: 0,
        currentBackend: 3,
        previousFrontend: 0,
        currentFrontend: 0,
    });
});
test('sync to existing current bucket from another service', async () => {
    const eventBus = new events_1.default();
    const config = {
        flagResolver: alwaysOnFlagResolver,
        getLogger: no_logger_1.default,
        eventBus: eventBus,
    };
    const uniqueConnectionStore = new fake_unique_connection_store_1.FakeUniqueConnectionStore();
    const uniqueConnectionService1 = new unique_connection_service_1.UniqueConnectionService({ uniqueConnectionStore }, config);
    const uniqueConnectionService2 = new unique_connection_service_1.UniqueConnectionService({ uniqueConnectionStore }, config);
    const uniqueConnectionReadModel = new unique_connection_read_model_1.UniqueConnectionReadModel(uniqueConnectionStore);
    uniqueConnectionService1.count({
        connectionId: 'connection1',
        type: 'backend',
    });
    uniqueConnectionService1.count({
        connectionId: 'connection2',
        type: 'backend',
    });
    await uniqueConnectionService1.sync();
    uniqueConnectionService2.count({
        connectionId: 'connection1',
        type: 'backend',
    });
    uniqueConnectionService2.count({
        connectionId: 'connection3',
        type: 'backend',
    });
    await uniqueConnectionService2.sync();
    const stats = await uniqueConnectionReadModel.getStats();
    expect(stats).toEqual({
        previous: 0,
        current: 3,
        previousBackend: 0,
        currentBackend: 3,
        previousFrontend: 0,
        currentFrontend: 0,
    });
});
test('sync to existing previous bucket from another service', async () => {
    const eventBus = new events_1.default();
    const config = {
        flagResolver: alwaysOnFlagResolver,
        getLogger: no_logger_1.default,
        eventBus: eventBus,
    };
    const uniqueConnectionStore = new fake_unique_connection_store_1.FakeUniqueConnectionStore();
    const uniqueConnectionReadModel = new unique_connection_read_model_1.UniqueConnectionReadModel(uniqueConnectionStore);
    const uniqueConnectionService1 = new unique_connection_service_1.UniqueConnectionService({ uniqueConnectionStore }, config);
    const uniqueConnectionService2 = new unique_connection_service_1.UniqueConnectionService({ uniqueConnectionStore }, config);
    uniqueConnectionService1.count({
        connectionId: 'connection1',
        type: 'backend',
    });
    uniqueConnectionService1.count({
        connectionId: 'connection2',
        type: 'backend',
    });
    await uniqueConnectionService1.sync((0, date_fns_1.addHours)(new Date(), 1));
    uniqueConnectionService2.count({
        connectionId: 'connection1',
        type: 'backend',
    });
    uniqueConnectionService2.count({
        connectionId: 'connection3',
        type: 'backend',
    });
    await uniqueConnectionService2.sync((0, date_fns_1.addHours)(new Date(), 1));
    const stats = await uniqueConnectionReadModel.getStats();
    expect(stats).toEqual({
        previous: 3,
        current: 0,
        previousBackend: 3,
        currentBackend: 0,
        previousFrontend: 0,
        currentFrontend: 0,
    });
});
test('populate previous and current', async () => {
    const eventBus = new events_1.default();
    const config = { flagResolver: alwaysOnFlagResolver, getLogger: no_logger_1.default, eventBus };
    const uniqueConnectionStore = new fake_unique_connection_store_1.FakeUniqueConnectionStore();
    const uniqueConnectionService = new unique_connection_service_1.UniqueConnectionService({ uniqueConnectionStore }, config);
    const uniqueConnectionReadModel = new unique_connection_read_model_1.UniqueConnectionReadModel(uniqueConnectionStore);
    uniqueConnectionService.count({
        connectionId: 'connection1',
        type: 'backend',
    });
    uniqueConnectionService.count({
        connectionId: 'connection2',
        type: 'backend',
    });
    await uniqueConnectionService.sync();
    await uniqueConnectionService.sync();
    uniqueConnectionService.count({
        connectionId: 'connection3',
        type: 'backend',
    });
    await uniqueConnectionService.sync((0, date_fns_1.addHours)(new Date(), 1));
    await uniqueConnectionService.sync((0, date_fns_1.addHours)(new Date(), 1)); // deliberate duplicate call
    uniqueConnectionService.count({
        connectionId: 'connection3',
        type: 'backend',
    });
    uniqueConnectionService.count({
        connectionId: 'connection4',
        type: 'backend',
    });
    await uniqueConnectionService.sync((0, date_fns_1.addHours)(new Date(), 1));
    await uniqueConnectionService.sync((0, date_fns_1.addHours)(new Date(), 1)); // deliberate duplicate call
    const stats = await uniqueConnectionReadModel.getStats();
    expect(stats).toEqual({
        previous: 3,
        current: 2,
        previousBackend: 3,
        currentBackend: 2,
        previousFrontend: 0,
        currentFrontend: 0,
    });
});
test('populate all buckets', async () => {
    const eventBus = new events_1.default();
    const config = { flagResolver: alwaysOnFlagResolver, getLogger: no_logger_1.default, eventBus };
    const uniqueConnectionStore = new fake_unique_connection_store_1.FakeUniqueConnectionStore();
    const uniqueConnectionService = new unique_connection_service_1.UniqueConnectionService({ uniqueConnectionStore }, config);
    const uniqueConnectionReadModel = new unique_connection_read_model_1.UniqueConnectionReadModel(uniqueConnectionStore);
    uniqueConnectionService.count({
        connectionId: 'connection1',
        type: 'backend',
    });
    uniqueConnectionService.count({
        connectionId: 'connection2',
        type: 'frontend',
    });
    await uniqueConnectionService.sync();
    await uniqueConnectionService.sync();
    uniqueConnectionService.count({
        connectionId: 'connection3',
        type: 'backend',
    });
    await uniqueConnectionService.sync((0, date_fns_1.addHours)(new Date(), 1));
    await uniqueConnectionService.sync((0, date_fns_1.addHours)(new Date(), 1)); // deliberate duplicate call
    uniqueConnectionService.count({
        connectionId: 'connection3',
        type: 'backend',
    });
    uniqueConnectionService.count({
        connectionId: 'connection4',
        type: 'frontend',
    });
    await uniqueConnectionService.sync((0, date_fns_1.addHours)(new Date(), 1));
    await uniqueConnectionService.sync((0, date_fns_1.addHours)(new Date(), 1)); // deliberate duplicate call
    const stats = await uniqueConnectionReadModel.getStats();
    expect(stats).toEqual({
        previous: 3,
        current: 2,
        previousBackend: 2,
        currentBackend: 1,
        previousFrontend: 1,
        currentFrontend: 1,
    });
});
//# sourceMappingURL=unique-connection-service.test.js.map