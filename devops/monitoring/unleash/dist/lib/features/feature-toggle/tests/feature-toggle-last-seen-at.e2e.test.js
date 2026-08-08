"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../../../test/e2e/helpers/database-init"));
const test_helper_1 = require("../../../../test/e2e/helpers/test-helper");
const no_logger_1 = __importDefault(require("../../../../test/fixtures/no-logger"));
let app;
let db;
const setupLastSeenAtTest = async (featureName) => {
    await app.createFeature(featureName);
    await (0, test_helper_1.insertLastSeenAt)(featureName, db.rawDatabase, 'development');
    await (0, test_helper_1.insertLastSeenAt)(featureName, db.rawDatabase, 'production');
};
beforeAll(async () => {
    const config = {
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
    };
    db = await (0, database_init_1.default)('feature_toggles_last_seen_at_refactor', no_logger_1.default, config);
    app = await (0, test_helper_1.setupAppWithCustomConfig)(db.stores, config, db.rawDatabase);
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});
test('should return last seen at per env for /api/admin/features', async () => {
    await app.createFeature('lastSeenAtPerEnv');
    await (0, test_helper_1.insertLastSeenAt)('lastSeenAtPerEnv', db.rawDatabase, 'development');
    const response = await app.request
        .get('/api/admin/projects/default/features')
        .expect('Content-Type', /json/)
        .expect(200);
    const found = await response.body.features.find((featureToggle) => featureToggle.name === 'lastSeenAtPerEnv');
    expect(found.environments[0].lastSeenAt).toEqual('2023-10-01T12:34:56.000Z');
});
test('response should include last seen at per environment for multiple environments in /api/admin/features', async () => {
    const featureName = 'multiple-environment-last-seen-at';
    await setupLastSeenAtTest(featureName);
    const { body } = await app.request
        .get('/api/admin/projects/default/features')
        .expect('Content-Type', /json/)
        .expect(200);
    const featureEnvironments = body.features[1].environments;
    const [development, production] = featureEnvironments;
    expect(development.name).toBe('development');
    expect(development.lastSeenAt).toEqual('2023-10-01T12:34:56.000Z');
    expect(production.name).toBe('production');
    expect(production.lastSeenAt).toEqual('2023-10-01T12:34:56.000Z');
});
test('response should include last seen at per environment for multiple environments in /api/admin/archive/features', async () => {
    const featureName = 'multiple-environment-last-seen-at-archived';
    await setupLastSeenAtTest(featureName);
    await app.request
        .delete(`/api/admin/projects/default/features/${featureName}`)
        .expect(202);
    const { body } = await app.request.get(`/api/admin/archive/features`);
    const featureEnvironments = body.features[0].environments;
    const [development, production] = featureEnvironments;
    expect(development.name).toBe('development');
    expect(development.lastSeenAt).toEqual('2023-10-01T12:34:56.000Z');
    expect(production.name).toBe('production');
    expect(production.lastSeenAt).toEqual('2023-10-01T12:34:56.000Z');
});
test('response should include last seen at per environment for multiple environments in /api/admin/archive/features/:projectId', async () => {
    const featureName = 'multiple-environment-last-seen-at-archived-project';
    await setupLastSeenAtTest(featureName);
    await app.request
        .delete(`/api/admin/projects/default/features/${featureName}`)
        .expect(202);
    const { body } = await app.request.get(`/api/admin/archive/features/default`);
    const featureEnvironments = body.features[0].environments;
    const [development, production] = featureEnvironments;
    expect(development.name).toBe('development');
    expect(development.lastSeenAt).toEqual('2023-10-01T12:34:56.000Z');
    expect(production.name).toBe('production');
    expect(production.lastSeenAt).toEqual('2023-10-01T12:34:56.000Z');
});
test('response should include last seen at per environment correctly for a single toggle /api/admin/project/:projectId/features/:featureName', async () => {
    const featureName = 'multiple-environment-last-seen-at-single-toggle';
    await app.createFeature(featureName);
    await setupLastSeenAtTest(`${featureName}1`);
    await setupLastSeenAtTest(`${featureName}2`);
    await setupLastSeenAtTest(`${featureName}3`);
    await setupLastSeenAtTest(`${featureName}4`);
    await setupLastSeenAtTest(`${featureName}5`);
    await (0, test_helper_1.insertLastSeenAt)(featureName, db.rawDatabase, 'development', '2023-08-01T12:30:56.000Z');
    await (0, test_helper_1.insertLastSeenAt)(featureName, db.rawDatabase, 'production', '2023-08-01T12:30:56.000Z');
    const { body } = await app.request
        .get(`/api/admin/projects/default/features/${featureName}`)
        .expect(200);
    const expected = [
        {
            name: 'development',
            lastSeenAt: '2023-08-01T12:30:56.000Z',
        },
        {
            name: 'production',
            lastSeenAt: '2023-08-01T12:30:56.000Z',
        },
    ];
    const toObject = (lastSeenAtEnvData) => Object.fromEntries(lastSeenAtEnvData.map((env) => [
        env.name,
        { lastSeenAt: env.lastSeenAt },
    ]));
    expect(toObject(body.environments)).toMatchObject(toObject(expected));
});
//# sourceMappingURL=feature-toggle-last-seen-at.e2e.test.js.map