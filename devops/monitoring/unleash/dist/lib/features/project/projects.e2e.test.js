"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../../test/e2e/helpers/database-init"));
const test_helper_1 = require("../../../test/e2e/helpers/test-helper");
const no_logger_1 = __importDefault(require("../../../test/fixtures/no-logger"));
const util_1 = require("../../util");
let app;
let db;
let projectStore;
const testDate = '2023-10-01T12:34:56.000Z';
beforeAll(async () => {
    db = await (0, database_init_1.default)('projects_api_serial', no_logger_1.default, {
        dbInitMethod: 'legacy',
    });
    app = await (0, test_helper_1.setupAppWithCustomConfig)(db.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
    }, db.rawDatabase);
    projectStore = db.stores.projectStore;
});
afterEach(async () => {
    await db.stores.featureToggleStore.deleteAll();
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});
test('should report has strategies and enabled strategies', async () => {
    const app = await (0, test_helper_1.setupAppWithCustomConfig)(db.stores, {
        experimental: {
            flags: {},
        },
    }, db.rawDatabase);
    await app.createFeature('featureWithStrategies');
    await app.createFeature('featureWithoutStrategies');
    await app.createFeature('featureWithDisabledStrategies');
    await app.addStrategyToFeatureEnv({
        name: 'default',
    }, util_1.DEFAULT_ENV, 'featureWithStrategies');
    await app.addStrategyToFeatureEnv({
        name: 'default',
        disabled: true,
    }, util_1.DEFAULT_ENV, 'featureWithDisabledStrategies');
    const { body } = await app.request
        .get('/api/admin/projects/default')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(body).toMatchObject({
        features: [
            {
                name: 'featureWithStrategies',
                environments: [
                    {
                        name: 'default',
                        hasStrategies: true,
                        hasEnabledStrategies: true,
                    },
                ],
            },
            {
                name: 'featureWithoutStrategies',
                environments: [
                    {
                        name: 'default',
                        hasStrategies: false,
                        hasEnabledStrategies: false,
                    },
                ],
            },
            {
                name: 'featureWithDisabledStrategies',
                environments: [
                    {
                        name: 'default',
                        hasStrategies: true,
                        hasEnabledStrategies: false,
                    },
                ],
            },
        ],
    });
});
test('Should ONLY return default project', async () => {
    projectStore.create({
        id: 'test2',
        name: 'test',
        description: '',
        mode: 'open',
    });
    const { body } = await app.request
        .get('/api/admin/projects')
        .expect(200)
        .expect('Content-Type', /json/);
    expect(body.projects).toHaveLength(1);
    expect(body.projects[0].id).toBe('default');
});
test('response should include created_at', async () => {
    const { body } = await app.request
        .get('/api/admin/projects')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(body.projects[0].createdAt).toBeDefined();
});
test('response for default project should include created_at', async () => {
    const { body } = await app.request
        .get('/api/admin/projects/default')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(body.createdAt).toBeDefined();
});
test('response for project overview should include feature type counts', async () => {
    await app.createFeature({
        name: 'my-new-release-toggle',
        type: 'release',
    });
    await app.createFeature({
        name: 'my-new-development-toggle',
        type: 'experiment',
    });
    const { body } = await app.request
        .get('/api/admin/projects/default/overview')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(body).toMatchObject({
        featureTypeCounts: [
            {
                type: 'experiment',
                count: 1,
            },
            {
                type: 'release',
                count: 1,
            },
        ],
    });
});
test('response should include last seen at per environment', async () => {
    await app.createFeature('my-new-feature-toggle');
    await (0, test_helper_1.insertLastSeenAt)('my-new-feature-toggle', db.rawDatabase, 'default', testDate);
    await (0, test_helper_1.insertFeatureEnvironmentsLastSeen)('my-new-feature-toggle', db.rawDatabase, 'default');
    const { body } = await app.request
        .get('/api/admin/projects/default')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(body.features[0].environments[0].lastSeenAt).toEqual(testDate);
    expect(body.features[0].lastSeenAt).toEqual(testDate);
    const appWithLastSeenRefactor = await (0, test_helper_1.setupAppWithCustomConfig)(db.stores, {}, db.rawDatabase);
    const response = await appWithLastSeenRefactor.request
        .get('/api/admin/projects/default')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(response.body.features[0].environments[0].lastSeenAt).toEqual('2023-10-01T12:34:56.000Z');
    expect(response.body.features[0].lastSeenAt).toEqual('2023-10-01T12:34:56.000Z');
});
test('response should include last seen at per environment for multiple environments', async () => {
    const appWithLastSeenRefactor = await (0, test_helper_1.setupAppWithCustomConfig)(db.stores, {}, db.rawDatabase);
    await app.createFeature('my-new-feature-toggle');
    await db.stores.environmentStore.create({
        name: 'development',
        type: 'development',
        sortOrder: 1,
        enabled: true,
    });
    await db.stores.environmentStore.create({
        name: 'production',
        type: 'production',
        sortOrder: 2,
        enabled: true,
    });
    await appWithLastSeenRefactor.services.projectService.addEnvironmentToProject('default', 'development');
    await appWithLastSeenRefactor.services.projectService.addEnvironmentToProject('default', 'production');
    await appWithLastSeenRefactor.createFeature('multiple-environment-last-seen-at');
    await (0, test_helper_1.insertLastSeenAt)('multiple-environment-last-seen-at', db.rawDatabase, 'default', '2023-10-01T12:32:56.000Z');
    await (0, test_helper_1.insertLastSeenAt)('multiple-environment-last-seen-at', db.rawDatabase, 'development', '2023-10-01T12:34:56.000Z');
    await (0, test_helper_1.insertLastSeenAt)('multiple-environment-last-seen-at', db.rawDatabase, 'production', '2023-10-01T12:33:56.000Z');
    const { body } = await appWithLastSeenRefactor.request
        .get('/api/admin/projects/default')
        .expect('Content-Type', /json/)
        .expect(200);
    const featureEnvironments = body.features[1].environments;
    const [def, development, production] = featureEnvironments;
    expect(def.name).toBe('default');
    expect(def.lastSeenAt).toEqual('2023-10-01T12:32:56.000Z');
    expect(development.name).toBe('development');
    expect(development.lastSeenAt).toEqual('2023-10-01T12:34:56.000Z');
    expect(production.name).toBe('production');
    expect(production.lastSeenAt).toEqual('2023-10-01T12:33:56.000Z');
    expect(body.features[1].lastSeenAt).toBe('2023-10-01T12:34:56.000Z');
});
//# sourceMappingURL=projects.e2e.test.js.map