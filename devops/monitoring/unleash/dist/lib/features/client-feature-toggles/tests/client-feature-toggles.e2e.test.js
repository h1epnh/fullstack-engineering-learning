"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("../../../types/model");
const database_init_1 = __importDefault(require("../../../../test/e2e/helpers/database-init"));
const test_helper_1 = require("../../../../test/e2e/helpers/test-helper");
const no_logger_1 = __importDefault(require("../../../../test/fixtures/no-logger"));
const constants_1 = require("../../../util/constants");
const types_1 = require("../../../types");
let app;
let db;
let dummyAdmin;
let proApp;
let proDb;
let enterpriseApp;
let enterpriseDb;
let enterpriseDummyAdmin;
let proDummyAdmin;
const getApiClientResponse = (project = 'default') => [
    {
        name: 'test1',
        type: 'release',
        enabled: false,
        project: project,
        stale: false,
        strategies: [
            {
                name: 'flexibleRollout',
                constraints: [
                    {
                        contextName: 'appName',
                        operator: 'IN',
                        values: ['test'],
                        caseInsensitive: false,
                        inverted: false,
                    },
                ],
                parameters: {
                    rollout: '100',
                    stickiness: 'default',
                    groupId: 'test1',
                },
                variants: [],
            },
        ],
        variants: [],
        description: null,
        impressionData: false,
    },
    {
        name: 'test2',
        type: 'release',
        enabled: false,
        project: project,
        stale: false,
        strategies: [
            {
                name: 'default',
                constraints: [
                    {
                        contextName: 'userId',
                        operator: 'IN',
                        values: ['123'],
                    },
                ],
                parameters: {},
                variants: [],
            },
        ],
        variants: [],
        description: null,
        impressionData: false,
    },
];
const cleanup = async (db, app) => {
    const all = await db.stores.projectStore.getEnvironmentsForProject('default');
    await Promise.all(all
        .filter((env) => env.environment !== constants_1.DEFAULT_ENV)
        .map(async (env) => db.stores.projectStore.deleteEnvironmentForProject('default', env.environment)));
    await db.stores.segmentStore.deleteAll();
};
const setupFeatures = async (db, app, project = 'default') => {
    await db.rawDatabase.raw('DELETE FROM features');
    await app.createFeature('test1', project);
    await app.createFeature('test2', project);
    const { body: segmentBody } = await app.createSegment({
        name: 'a',
        constraints: [
            {
                contextName: 'appName',
                operator: 'IN',
                values: ['test'],
                caseInsensitive: false,
                inverted: false,
            },
        ],
    });
    await app.addStrategyToFeatureEnv({
        name: 'flexibleRollout',
        constraints: [],
        segments: [segmentBody.id],
        parameters: {
            rollout: '100',
            stickiness: 'default',
            groupId: 'test1',
        },
    }, constants_1.DEFAULT_ENV, 'test1', project);
    await app.addStrategyToFeatureEnv({
        name: 'default',
        constraints: [
            { contextName: 'userId', operator: 'IN', values: ['123'] },
        ],
        parameters: {},
    }, constants_1.DEFAULT_ENV, 'test2', project);
};
beforeAll(async () => {
    db = await (0, database_init_1.default)('client_feature_toggles', no_logger_1.default);
    app = await (0, test_helper_1.setupAppWithCustomConfig)(db.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
                deltaApi: true,
            },
        },
    }, db.rawDatabase);
    enterpriseDb = await (0, database_init_1.default)('client_feature_toggles_enterprise', no_logger_1.default);
    enterpriseApp = await (0, test_helper_1.setupAppWithCustomConfig)(enterpriseDb.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
        ui: {
            environment: 'Enterprise',
        },
    }, enterpriseDb.rawDatabase);
    proDb = await (0, database_init_1.default)('client_feature_toggles_pro', no_logger_1.default);
    proApp = await (0, test_helper_1.setupAppWithCustomConfig)(proDb.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
        ui: {
            environment: 'Pro',
        },
    }, proDb.rawDatabase);
    dummyAdmin = await app.services.userService.createUser({
        name: 'Some Name',
        email: 'test@getunleash.io',
        rootRole: model_1.RoleName.ADMIN,
    }, types_1.TEST_AUDIT_USER);
    enterpriseDummyAdmin = await enterpriseApp.services.userService.createUser({
        name: 'Some Name',
        email: 'test@getunleash.io',
        rootRole: model_1.RoleName.ADMIN,
    }, types_1.TEST_AUDIT_USER);
    proDummyAdmin = await proApp.services.userService.createUser({
        name: 'Some Name',
        email: 'test@getunleash.io',
        rootRole: model_1.RoleName.ADMIN,
    }, types_1.TEST_AUDIT_USER);
});
afterEach(async () => {
    await cleanup(db, app);
    await cleanup(proDb, proApp);
    await cleanup(enterpriseDb, enterpriseApp);
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
    await proApp.destroy();
    await proDb.destroy();
    await enterpriseApp.destroy();
    await enterpriseDb.destroy();
});
test('should fetch single feature', async () => {
    expect.assertions(1);
    await app.createFeature('test_', 'default');
    return app.request
        .get(`/api/client/features/test_`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
        expect(res.body.name === 'test_').toBe(true);
    });
});
test('should support name prefix', async () => {
    expect.assertions(2);
    await app.createFeature('a_test1');
    await app.createFeature('a_test2');
    await app.createFeature('b_test1');
    await app.createFeature('b_test2');
    const namePrefix = 'b_';
    return app.request
        .get(`/api/client/features?namePrefix=${namePrefix}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
        expect(res.body.features.length).toBe(2);
        expect(res.body.features[1].name).toBe('b_test2');
    });
});
test('should support filtering on project', async () => {
    expect.assertions(2);
    await app.services.projectService.createProject({ name: 'projectA', id: 'projecta' }, dummyAdmin, types_1.TEST_AUDIT_USER);
    await app.services.projectService.createProject({ name: 'projectB', id: 'projectb' }, dummyAdmin, types_1.TEST_AUDIT_USER);
    await app.createFeature('ab_test1', 'projecta');
    await app.createFeature('bd_test2', 'projectb');
    return app.request
        .get(`/api/client/features?project=projecta`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
        expect(res.body.features).toHaveLength(1);
        expect(res.body.features[0].name).toBe('ab_test1');
    });
});
test('should return correct data structure from /api/client/features', async () => {
    await setupFeatures(db, app);
    const result = await app.request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(result.body.features).toEqual(getApiClientResponse());
});
test('should return correct data structure from /api/client/features for pro', async () => {
    await proApp.services.projectService.createProject({ name: 'Pro', id: 'pro' }, proDummyAdmin, types_1.TEST_AUDIT_USER);
    await setupFeatures(proDb, proApp, 'pro');
    const result = await proApp.request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(result.body.features).toEqual(getApiClientResponse('pro'));
});
test('should return correct data structure from /api/client/features for Enterprise', async () => {
    await enterpriseApp.services.projectService.createProject({ name: 'Enterprise', id: 'enterprise' }, enterpriseDummyAdmin, types_1.TEST_AUDIT_USER);
    await setupFeatures(enterpriseDb, enterpriseApp, 'enterprise');
    const result = await enterpriseApp.request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(result.body.features).toEqual(getApiClientResponse('enterprise'));
});
test('should match snapshot from /api/client/features', async () => {
    await setupFeatures(db, app);
    const result = await app.request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(result.body).toMatchSnapshot();
});
//# sourceMappingURL=client-feature-toggles.e2e.test.js.map