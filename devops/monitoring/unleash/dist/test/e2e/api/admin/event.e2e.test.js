"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_helper_1 = require("../../helpers/test-helper");
const database_init_1 = __importDefault(require("../../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../fixtures/no-logger"));
const events_1 = require("../../../../lib/types/events");
const random_id_1 = require("../../../../lib/util/random-id");
const types_1 = require("../../../../lib/types");
const features_1 = require("../../../../lib/features");
const test_config_1 = require("../../../config/test-config");
let app;
let db;
let eventService;
const TEST_USER_ID = -9999;
const config = (0, test_config_1.createTestConfig)();
beforeAll(async () => {
    db = await (0, database_init_1.default)('event_api_serial', no_logger_1.default);
    app = await (0, test_helper_1.setupAppWithCustomConfig)(db.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
    });
    eventService = (0, features_1.createEventsService)(db.rawDatabase, config);
});
beforeEach(async () => {
    await db.stores.eventStore.deleteAll();
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});
test('returns events', async () => {
    expect.assertions(0);
    return app.request
        .get('/api/admin/events')
        .expect('Content-Type', /json/)
        .expect(200);
});
test('returns events given a name', async () => {
    expect.assertions(0);
    return app.request
        .get('/api/admin/events/myname')
        .expect('Content-Type', /json/)
        .expect(200);
});
test('Can filter by project', async () => {
    await eventService.storeEvent({
        type: events_1.FEATURE_CREATED,
        project: 'something-else',
        data: { id: 'some-other-feature' },
        tags: [],
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });
    await eventService.storeEvent({
        type: events_1.FEATURE_CREATED,
        project: 'default',
        data: { id: 'feature' },
        tags: [],
        createdBy: 'test-user',
        environment: 'test',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });
    await app.request
        .get('/api/admin/events?project=default')
        .expect(200)
        .expect((res) => {
        expect(res.body.events).toHaveLength(1);
        expect(res.body.events[0].data.id).toEqual('feature');
    });
});
test('can search for events', async () => {
    const events = [
        {
            type: events_1.FEATURE_CREATED,
            project: (0, random_id_1.randomId)(),
            data: { id: (0, random_id_1.randomId)() },
            tags: [],
            createdBy: (0, random_id_1.randomId)(),
            createdByUserId: TEST_USER_ID,
            ip: '127.0.0.1',
        },
        {
            type: events_1.FEATURE_CREATED,
            project: (0, random_id_1.randomId)(),
            data: { id: (0, random_id_1.randomId)() },
            preData: { id: (0, random_id_1.randomId)() },
            tags: [{ type: 'simple', value: (0, random_id_1.randomId)() }],
            createdBy: (0, random_id_1.randomId)(),
            createdByUserId: TEST_USER_ID,
            ip: '127.0.0.1',
        },
    ];
    await Promise.all(events.map((event) => {
        return eventService.storeEvent(event);
    }));
    await app.request
        .post('/api/admin/events/search')
        .send({})
        .expect(200)
        .expect((res) => {
        expect(res.body.events).toHaveLength(2);
    });
    await app.request
        .post('/api/admin/events/search')
        .send({ limit: 1, offset: 1 })
        .expect(200)
        .expect((res) => {
        expect(res.body.events).toHaveLength(1);
    });
    await app.request
        .post('/api/admin/events/search')
        .send({ query: events[1].data.id })
        .expect(200)
        .expect((res) => {
        expect(res.body.events).toHaveLength(1);
        expect(res.body.events[0].data.id).toEqual(events[1].data.id);
    });
    await app.request
        .post('/api/admin/events/search')
        .send({ query: events[1].preData.id })
        .expect(200)
        .expect((res) => {
        expect(res.body.events).toHaveLength(1);
        expect(res.body.events[0].preData.id).toEqual(events[1].preData.id);
    });
    await app.request
        .post('/api/admin/events/search')
        .send({ query: events[1].tags[0].value })
        .expect(200)
        .expect((res) => {
        expect(res.body.events).toHaveLength(1);
        expect(res.body.events[0].data.id).toEqual(events[1].data.id);
    });
});
test('event creators - if system user, return system name, else should return name from database if user exists, else from events table', async () => {
    const user = await db.stores.userStore.insert({ name: 'database-user' });
    const events = [
        {
            type: events_1.FEATURE_CREATED,
            project: (0, random_id_1.randomId)(),
            createdBy: 'should-not-use-this-name',
            createdByUserId: types_1.SYSTEM_USER.id,
            ip: '127.0.0.1',
        },
        {
            type: events_1.FEATURE_CREATED,
            project: (0, random_id_1.randomId)(),
            createdBy: 'test-user1',
            createdByUserId: user.id,
            ip: '127.0.0.1',
        },
        {
            type: events_1.FEATURE_CREATED,
            project: (0, random_id_1.randomId)(),
            createdBy: 'test-user2',
            createdByUserId: 2,
            ip: '127.0.0.1',
        },
    ];
    await Promise.all(events.map((event) => {
        return eventService.storeEvent(event);
    }));
    const { body } = await app.request
        .get('/api/admin/event-creators')
        .expect(200);
    expect(body).toMatchObject([
        {
            id: types_1.SYSTEM_USER.id,
            name: types_1.SYSTEM_USER.name,
        },
        {
            id: 1,
            name: 'database-user',
        },
        {
            id: 2,
            name: 'test-user2',
        },
    ]);
});
test('event creators - takes single distinct username, if 2 users have same id', async () => {
    const events = [
        {
            type: events_1.FEATURE_CREATED,
            project: (0, random_id_1.randomId)(),
            createdBy: 'test-user4',
            createdByUserId: 2,
            ip: '127.0.0.1',
        },
        {
            type: events_1.FEATURE_CREATED,
            project: (0, random_id_1.randomId)(),
            createdBy: 'test-user2',
            createdByUserId: 2,
            ip: '127.0.0.1',
        },
    ];
    await Promise.all(events.map((event) => {
        return eventService.storeEvent(event);
    }));
    const { body } = await app.request
        .get('/api/admin/event-creators')
        .expect(200);
    expect(body).toMatchObject([
        {
            id: 2,
        },
    ]);
});
//# sourceMappingURL=event.e2e.test.js.map