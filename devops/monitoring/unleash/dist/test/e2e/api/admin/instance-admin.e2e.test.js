"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../helpers/database-init"));
const test_helper_1 = require("../../helpers/test-helper");
const no_logger_1 = __importDefault(require("../../../fixtures/no-logger"));
const api_token_1 = require("../../../../lib/types/models/api-token");
const metrics_1 = require("../../../../lib/metrics");
let app;
let db;
let stores;
let refreshDbMetrics;
beforeAll(async () => {
    db = await (0, database_init_1.default)('instance_admin_api_serial', no_logger_1.default, {
        dbInitMethod: 'legacy',
    });
    stores = db.stores;
    await stores.settingStore.insert('instanceInfo', { id: 'test-static' });
    app = await (0, test_helper_1.setupAppWithCustomConfig)(stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
    }, db.rawDatabase);
    const { collectAggDbMetrics } = (0, metrics_1.registerPrometheusMetrics)(app.config, stores, undefined, app.config.eventBus, app.services.instanceStatsService);
    refreshDbMetrics = collectAggDbMetrics;
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});
test('should return instance statistics', async () => {
    await stores.featureToggleStore.create('default', {
        name: 'TestStats1',
        createdByUserId: 9999,
    });
    await refreshDbMetrics();
    return app.request
        .get('/api/admin/instance-admin/statistics')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
        expect(res.body.featureToggles).toBe(1);
    });
});
test('api tokens are serialized correctly', async () => {
    await app.services.apiTokenService.createApiTokenWithProjects({
        tokenName: 'admin',
        type: api_token_1.ApiTokenType.ADMIN,
        environment: '*',
        projects: ['*'],
    });
    await app.services.apiTokenService.createApiTokenWithProjects({
        tokenName: 'frontend',
        type: api_token_1.ApiTokenType.FRONTEND,
        environment: 'default',
        projects: ['*'],
    });
    await app.services.apiTokenService.createApiTokenWithProjects({
        tokenName: 'client',
        type: api_token_1.ApiTokenType.CLIENT,
        environment: 'default',
        projects: ['*'],
    });
    const { body } = await app.request
        .get('/api/admin/instance-admin/statistics')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(body).toMatchObject({
        apiTokens: { client: 1, admin: 1, frontend: 1 },
    });
    const { text: csv } = await app.request
        .get('/api/admin/instance-admin/statistics/csv')
        .expect('Content-Type', /text\/csv/)
        .expect(200);
    expect(csv).toMatch(/{""client"":1,""admin"":1,""frontend"":1}/);
});
test('should return instance statistics with correct number of projects', async () => {
    await stores.projectStore.create({
        id: 'test',
        name: 'Test',
        description: 'lorem',
        mode: 'open',
    });
    return app.request
        .get('/api/admin/instance-admin/statistics')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
        expect(res.body.projects).toBe(2);
    });
});
test('should return signed instance statistics', async () => {
    return app.request
        .get('/api/admin/instance-admin/statistics')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
        expect(res.body.instanceId).toBe('test-static');
        expect(res.body.sum).toBe('5ba2cb7c3e29f4e5b3382c560b92b837f3603dc7db73a501ec331c7f0ed17bd0');
    });
});
test('should return instance statistics as CSV', async () => {
    await stores.featureToggleStore.create('default', {
        name: 'TestStats2',
        createdByUserId: 9999,
    });
    await stores.featureToggleStore.create('default', {
        name: 'TestStats3',
        createdByUserId: 9999,
    });
    const res = await app.request
        .get('/api/admin/instance-admin/statistics/csv')
        .expect('Content-Type', /text\/csv/)
        .expect(200);
    expect(res.text).toMatch(/featureToggles/);
    expect(res.text).toMatch(/"sum"/);
});
test('contains new max* properties', async () => {
    const { body } = await app.request
        .get('/api/admin/instance-admin/statistics')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(body).toMatchObject({
        maxEnvironmentStrategies: 0,
        maxConstraints: 0,
        maxConstraintValues: 0,
    });
});
//# sourceMappingURL=instance-admin.e2e.test.js.map