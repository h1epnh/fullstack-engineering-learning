"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_helper_1 = require("../../helpers/test-helper");
const client_metrics_json_1 = __importDefault(require("../../../examples/client-metrics.json"));
const database_init_1 = __importDefault(require("../../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../fixtures/no-logger"));
const metric_events_1 = require("../../../../lib/metric-events");
let app;
let db;
beforeAll(async () => {
    db = await (0, database_init_1.default)('metrics_api_client', no_logger_1.default);
    app = await (0, test_helper_1.setupAppWithCustomConfig)(db.stores, {
        experimental: {
            flags: {
                responseTimeMetricsFix: true,
            },
        },
    });
});
afterEach(async () => {
    await Promise.all([
        db.stores.clientMetricsStoreV2.deleteAll(),
        db.stores.clientInstanceStore.deleteAll(),
    ]);
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});
test('should be possible to send metrics', async () => {
    return app.request
        .post('/api/client/metrics')
        .send(client_metrics_json_1.default)
        .expect(202);
});
test('should require valid send metrics', async () => {
    return app.request
        .post('/api/client/metrics')
        .send({
        appName: 'test',
    })
        .expect(400);
});
test('should accept empty client metrics', async () => {
    return app.request
        .post('/api/client/metrics')
        .send({
        appName: 'demo',
        instanceId: '1',
        bucket: {
            start: Date.now(),
            stop: Date.now(),
            toggles: {},
        },
    })
        .expect(202);
});
test('should create instance if does not exist', async () => {
    const instances = await db.stores.clientInstanceStore.getAll();
    expect(instances.length).toBe(0);
    await app.request
        .post('/api/client/metrics')
        .send(client_metrics_json_1.default)
        .expect(202);
    const finalInstances = await db.stores.clientInstanceStore.getAll();
    expect(finalInstances.length).toBe(1);
});
test('should emit response time metrics data in the correct path', async () => {
    const badMetrics = {
        ...client_metrics_json_1.default,
        bucket: { ...client_metrics_json_1.default.bucket, stop: null },
    };
    let timeInfo = undefined;
    app.config.eventBus.on(metric_events_1.REQUEST_TIME, (data) => {
        timeInfo = data;
    });
    await app.request.post('/api/client/metrics').send(badMetrics).expect(400);
    // wait in a loop of 10 milliseconds step while triggered is false
    // or until 1000 milliseconds have passed
    while (timeInfo === undefined) {
        console.log('Waiting for event to be triggered');
        await new Promise((resolve) => setTimeout(resolve, 10));
    }
    expect(timeInfo).toMatchObject({
        method: 'POST',
        statusCode: 400,
        path: '/api/client/metrics',
    });
    app.config.eventBus.removeAllListeners();
});
//# sourceMappingURL=metrics.e2e.test.js.map