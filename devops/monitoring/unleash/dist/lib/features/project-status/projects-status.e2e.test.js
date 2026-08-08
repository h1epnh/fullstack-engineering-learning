"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../../test/e2e/helpers/database-init"));
const test_helper_1 = require("../../../test/e2e/helpers/test-helper");
const no_logger_1 = __importDefault(require("../../../test/fixtures/no-logger"));
const types_1 = require("../../types");
const createEventsService_1 = require("../events/createEventsService");
const test_config_1 = require("../../../test/config/test-config");
const util_1 = require("../../util");
const api_token_1 = require("../../types/models/api-token");
let app;
let db;
let eventService;
const TEST_USER_ID = -9999;
const config = (0, test_config_1.createTestConfig)();
const insertHealthScore = (id, health) => {
    const irrelevantFlagTrendDetails = {
        total_flags: 10,
        stale_flags: 10,
        potentially_stale_flags: 10,
    };
    return db.rawDatabase('flag_trends').insert({
        ...irrelevantFlagTrendDetails,
        id,
        project: 'default',
        health,
    });
};
const getCurrentDateStrings = () => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    return { todayString, yesterdayString };
};
beforeAll(async () => {
    db = await (0, database_init_1.default)('projects_status', no_logger_1.default);
    app = await (0, test_helper_1.setupAppWithCustomConfig)(db.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
    }, db.rawDatabase);
    eventService = (0, createEventsService_1.createEventsService)(db.rawDatabase, config);
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});
beforeEach(async () => {
    await db.stores.clientMetricsStoreV2.deleteAll();
    await db.rawDatabase('flag_trends').delete();
});
test('project insights should return correct count for each day', async () => {
    await eventService.storeEvent({
        type: types_1.FEATURE_CREATED,
        project: 'default',
        data: { featureName: 'today-event' },
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });
    await eventService.storeEvent({
        type: types_1.FEATURE_CREATED,
        project: 'default',
        data: { featureName: 'today-event-two' },
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });
    await eventService.storeEvent({
        type: types_1.FEATURE_CREATED,
        project: 'default',
        data: { featureName: 'yesterday-event' },
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });
    const { events } = await eventService.getEvents();
    const yesterdayEvent = events.find((e) => e.data.featureName === 'yesterday-event');
    const { todayString, yesterdayString } = getCurrentDateStrings();
    await db.rawDatabase.raw(`UPDATE events SET created_at = ? where id = ?`, [
        yesterdayString,
        yesterdayEvent?.id,
    ]);
    const { body } = await app.request
        .get('/api/admin/projects/default/status')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(body).toMatchObject({
        activityCountByDate: [
            { date: yesterdayString, count: 1 },
            { date: todayString, count: 2 },
        ],
    });
});
test('project resources should contain the right data', async () => {
    const { body: noResourcesBody } = await app.request
        .get('/api/admin/projects/default/status')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(noResourcesBody.resources).toMatchObject({
        members: 0,
        apiTokens: 0,
        segments: 0,
    });
    const flagName = (0, util_1.randomId)();
    await app.createFeature(flagName);
    const environment = 'default';
    await db.stores.clientMetricsStoreV2.batchInsertMetrics([
        {
            featureName: flagName,
            appName: `web2`,
            environment,
            timestamp: new Date(),
            yes: 5,
            no: 2,
        },
    ]);
    await app.services.apiTokenService.createApiTokenWithProjects({
        tokenName: 'test-token',
        projects: ['default'],
        type: api_token_1.ApiTokenType.CLIENT,
        environment: 'default',
    });
    await app.services.segmentService.create({
        name: 'test-segment',
        project: 'default',
        constraints: [],
    }, {});
    const admin = await app.services.userService.createUser({
        username: 'admin',
        rootRole: types_1.RoleName.ADMIN,
    });
    const user = await app.services.userService.createUser({
        username: 'test-user',
        rootRole: types_1.RoleName.EDITOR,
    });
    await app.services.projectService.addAccess('default', [4], [], [user.id], {
        ...admin,
        ip: '',
    });
    const { body } = await app.request
        .get('/api/admin/projects/default/status')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(body.resources).toMatchObject({
        members: 1,
        apiTokens: 1,
        segments: 1,
    });
});
test('project health contains the current health score', async () => {
    const { body } = await app.request
        .get('/api/admin/projects/default/status')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(body.health.current).toBe(100);
});
test('project status contains lifecycle data', async () => {
    const { body } = await app.request
        .get('/api/admin/projects/default/status')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(body.lifecycleSummary).toMatchObject({
        initial: {
            averageDays: null,
            currentFlags: 0,
        },
        preLive: {
            averageDays: null,
            currentFlags: 0,
        },
        live: {
            averageDays: null,
            currentFlags: 0,
        },
        completed: {
            averageDays: null,
            currentFlags: 0,
        },
        archived: {
            currentFlags: 0,
            last30Days: 0,
        },
    });
});
test('project status includes stale flags', async () => {
    const otherProject = await app.services.projectService.createProject({
        name: 'otherProject',
        id: (0, util_1.randomId)(),
    }, {}, {});
    function cartesianProduct(...arrays) {
        return arrays.reduce((acc, array) => {
            return acc.flatMap((accItem) => array.map((item) => [...accItem, item]));
        }, [[]]);
    }
    // of all 16 (2^4) permutations, only 3 are unhealthy flags in a given project.
    const combinations = cartesianProduct([false, true], // stale
    [false, true], // potentially stale
    [false, true], // archived
    ['default', otherProject.id]);
    for (const [stale, potentiallyStale, archived, project] of combinations) {
        const name = `flag-${project}-stale-${stale}-potentially-stale-${potentiallyStale}-archived-${archived}`;
        await app.createFeature({
            name,
            stale,
        }, project);
        if (potentiallyStale) {
            await db
                .rawDatabase('features')
                .update('potentially_stale', true)
                .where({ name });
        }
        if (archived) {
            await app.archiveFeature(name, project);
        }
    }
    const { body } = await app.request
        .get('/api/admin/projects/default/status')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(body.staleFlags).toMatchObject({
        total: 3,
    });
});
//# sourceMappingURL=projects-status.e2e.test.js.map