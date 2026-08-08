"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_helper_1 = require("../../helpers/test-helper");
const client_metrics_json_1 = __importDefault(require("../../../examples/client-metrics.json"));
const database_init_1 = __importDefault(require("../../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../fixtures/no-logger"));
const api_token_1 = require("../../../../lib/types/models/api-token");
const types_1 = require("../../../../lib/types");
let app;
let db;
let defaultToken;
beforeAll(async () => {
    db = await (0, database_init_1.default)('metrics_two_api_client', no_logger_1.default, {
        dbInitMethod: 'legacy',
    });
    app = await (0, test_helper_1.setupAppWithAuth)(db.stores, {}, db.rawDatabase);
    defaultToken =
        await app.services.apiTokenService.createApiTokenWithProjects({
            type: api_token_1.ApiTokenType.CLIENT,
            projects: ['default'],
            environment: 'default',
            tokenName: 'tester',
        });
});
afterEach(async () => {
    await db.stores.clientMetricsStoreV2.deleteAll();
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});
test('should be possible to send metrics', async () => {
    return app.request
        .post('/api/client/metrics')
        .set('Authorization', defaultToken.secret)
        .send(client_metrics_json_1.default)
        .expect(202);
});
test('should require valid send metrics', async () => {
    return app.request
        .post('/api/client/metrics')
        .set('Authorization', defaultToken.secret)
        .send({
        appName: 'test',
    })
        .expect(400);
});
test('should accept client metrics', async () => {
    return app.request
        .post('/api/client/metrics')
        .set('Authorization', defaultToken.secret)
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
test('should pick up environment from token', async () => {
    const environment = 'test';
    await db.stores.environmentStore.create({ name: 'test', type: 'test' });
    const token = await app.services.apiTokenService.createApiToken({
        type: api_token_1.ApiTokenType.CLIENT,
        project: 'default',
        environment,
        tokenName: 'tester',
    });
    await app.request
        .post('/api/client/metrics')
        .set('Authorization', token.secret)
        .send({
        appName: 'some-fancy-app',
        instanceId: '1',
        bucket: {
            start: Date.now(),
            stop: Date.now(),
            toggles: {
                test: {
                    yes: 100,
                    no: 50,
                },
            },
        },
    })
        .expect(202);
    await app.services.clientMetricsServiceV2.bulkAdd();
    const metrics = await db.stores.clientMetricsStoreV2.getAll();
    expect(metrics[0].environment).toBe('test');
    expect(metrics[0].appName).toBe('some-fancy-app');
});
test('should set lastSeen for toggles with metrics both for toggle and toggle env', async () => {
    const start = Date.now();
    await app.services.featureToggleService.createFeatureToggle('default', { name: 't1' }, types_1.TEST_AUDIT_USER);
    await app.services.featureToggleService.createFeatureToggle('default', { name: 't2' }, types_1.TEST_AUDIT_USER);
    const token = await app.services.apiTokenService.createApiToken({
        type: api_token_1.ApiTokenType.CLIENT,
        project: 'default',
        environment: 'default',
        tokenName: 'tester',
    });
    await app.request
        .post('/api/client/metrics')
        .set('Authorization', token.secret)
        .send({
        appName: 'some-fancy-app',
        instanceId: '1',
        bucket: {
            start: Date.now(),
            stop: Date.now(),
            toggles: {
                t1: {
                    yes: 100,
                    no: 50,
                },
                t2: {
                    yes: 0,
                    no: 0,
                },
            },
        },
    })
        .expect(202);
    await app.services.clientMetricsServiceV2.bulkAdd();
    await app.services.lastSeenService.store();
    const t1 = await app.services.featureToggleService.getFeature({
        featureName: 't1',
        archived: false,
        environmentVariants: true,
        projectId: 'default',
    });
    const t2 = await app.services.featureToggleService.getFeature({
        featureName: 't2',
        archived: false,
        environmentVariants: true,
        projectId: 'default',
    });
    const t1Env = t1.environments.find((e) => e.name === 'default');
    const t2Env = t2.environments.find((e) => e.name === 'default');
    expect(t1.lastSeenAt?.getTime()).toBeGreaterThanOrEqual(start);
    expect(t1Env?.lastSeenAt.getTime()).toBeGreaterThanOrEqual(start);
    expect(t2?.lastSeenAt).toBeDefined();
    expect(t2Env?.lastSeenAt).toBeDefined();
});
//# sourceMappingURL=metricsV2.e2e.test.js.map