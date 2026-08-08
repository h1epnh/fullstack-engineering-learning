"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../../test/e2e/helpers/database-init"));
const test_helper_1 = require("../../../test/e2e/helpers/test-helper");
const no_logger_1 = __importDefault(require("../../../test/fixtures/no-logger"));
const types_1 = require("../../types");
let app;
let db;
let integrationEventsService;
let integrationId;
const EVENT_SUCCESS = {
    integrationId: 1,
    state: 'success',
    stateDetails: 'Saul Goodman',
    event: {
        id: 7,
        type: 'feature-created',
        createdAt: new Date().toISOString(),
        createdBy: 'Walter White',
    },
    details: {
        featureName: 'heisenberg',
        projectName: 'breaking-bad',
    },
};
const EVENT_FAILED = {
    ...EVENT_SUCCESS,
    state: 'failed',
    stateDetails: 'Better Call Saul!',
};
const INTEGRATION = {
    provider: 'webhook',
    enabled: true,
    parameters: {
        url: 'http://some-test-url',
    },
    events: ['feature-created'],
};
beforeAll(async () => {
    db = await (0, database_init_1.default)('integration_events', no_logger_1.default);
    app = await (0, test_helper_1.setupAppWithCustomConfig)(db.stores, {
        experimental: {
            flags: {},
        },
    }, db.rawDatabase);
    integrationEventsService = app.services.integrationEventsService;
});
beforeEach(async () => {
    await db.reset();
    const { id } = await app.services.addonService.createAddon(INTEGRATION, types_1.TEST_AUDIT_USER);
    integrationId = id;
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});
const insertPastEvent = async (event, date) => {
    const { id } = await integrationEventsService.registerEvent(event);
    await db.rawDatabase.raw(`UPDATE integration_events SET created_at = ? WHERE id = ?`, [date, id]);
};
const getTestEventSuccess = () => ({
    ...EVENT_SUCCESS,
    integrationId,
});
const getTestEventFailed = () => ({
    ...EVENT_FAILED,
    integrationId,
});
test('insert and fetch integration events', async () => {
    await integrationEventsService.registerEvent(getTestEventSuccess());
    await integrationEventsService.registerEvent(getTestEventFailed());
    const events = await integrationEventsService.getPaginatedEvents(integrationId, 10, 0);
    expect(events).toHaveLength(2);
    expect(events[0].state).toBe('failed');
    expect(events[1].state).toBe('success');
});
test('paginate to latest event', async () => {
    await integrationEventsService.registerEvent(getTestEventSuccess());
    await integrationEventsService.registerEvent(getTestEventFailed());
    const events = await integrationEventsService.getPaginatedEvents(integrationId, 1, 0);
    expect(events).toHaveLength(1);
    expect(events[0].state).toBe('failed');
});
test('paginate to second most recent event', async () => {
    await integrationEventsService.registerEvent(getTestEventSuccess());
    await integrationEventsService.registerEvent(getTestEventFailed());
    const events = await integrationEventsService.getPaginatedEvents(integrationId, 1, 1);
    expect(events).toHaveLength(1);
    expect(events[0].state).toBe('success');
});
test('paginate to non-existing event, returning empty array', async () => {
    await integrationEventsService.registerEvent(getTestEventSuccess());
    await integrationEventsService.registerEvent(getTestEventFailed());
    const events = await integrationEventsService.getPaginatedEvents(integrationId, 1, 999);
    expect(events).toHaveLength(0);
});
test('clean up events, keeping events from the last 2 hours', async () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const longTimeAgo = new Date('2000-01-01');
    await insertPastEvent(getTestEventSuccess(), threeHoursAgo);
    await insertPastEvent(getTestEventFailed(), twoDaysAgo);
    await insertPastEvent(getTestEventSuccess(), longTimeAgo);
    await insertPastEvent(getTestEventFailed(), oneHourAgo);
    await integrationEventsService.registerEvent(getTestEventSuccess());
    await integrationEventsService.cleanUpEvents();
    const events = await integrationEventsService.getPaginatedEvents(integrationId, 10, 0);
    expect(events).toHaveLength(2);
    expect(events[0].state).toBe('success');
    expect(events[1].state).toBe('failed');
});
test('clean up events, keeping the last 100 events', async () => {
    for (let i = 0; i < 200; i++) {
        await integrationEventsService.registerEvent(getTestEventSuccess());
    }
    await integrationEventsService.cleanUpEvents();
    const events = await integrationEventsService.getPaginatedEvents(integrationId, 200, 0);
    expect(events).toHaveLength(100);
});
test('clean up events, keeping the latest event for each integration', async () => {
    const longTimeAgo = new Date('2000-01-01');
    const { id: integrationId2 } = await app.services.addonService.createAddon(INTEGRATION, types_1.TEST_AUDIT_USER);
    await insertPastEvent(getTestEventSuccess(), longTimeAgo);
    await insertPastEvent(getTestEventFailed(), longTimeAgo);
    await insertPastEvent({ ...getTestEventSuccess(), integrationId: integrationId2 }, longTimeAgo);
    await insertPastEvent({ ...getTestEventFailed(), integrationId: integrationId2 }, longTimeAgo);
    await integrationEventsService.cleanUpEvents();
    const eventsIntegration1 = await integrationEventsService.getPaginatedEvents(integrationId, 10, 0);
    expect(eventsIntegration1).toHaveLength(1);
    expect(eventsIntegration1[0].state).toBe('failed');
    const eventsIntegration2 = await integrationEventsService.getPaginatedEvents(integrationId2, 10, 0);
    expect(eventsIntegration2).toHaveLength(1);
    expect(eventsIntegration2[0].state).toBe('failed');
});
test('return events from the API', async () => {
    await integrationEventsService.registerEvent(getTestEventSuccess());
    await integrationEventsService.registerEvent(getTestEventFailed());
    const { body } = await app.request.get(`/api/admin/addons/${integrationId}/events`);
    expect(body.integrationEvents).toHaveLength(2);
    expect(body.integrationEvents[0].state).toBe('failed');
    expect(body.integrationEvents[1].state).toBe('success');
});
//# sourceMappingURL=integration-events.e2e.test.js.map