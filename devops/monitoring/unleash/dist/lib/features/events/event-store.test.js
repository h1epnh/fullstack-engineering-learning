"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const knex_1 = __importDefault(require("knex"));
const event_store_1 = __importDefault(require("./event-store"));
const no_logger_1 = __importDefault(require("../../../test/fixtures/no-logger"));
const date_fns_1 = require("date-fns");
const database_init_1 = __importDefault(require("../../../test/e2e/helpers/database-init"));
beforeAll(() => {
    no_logger_1.default.setMuteError(true);
});
afterAll(() => {
    no_logger_1.default.setMuteError(false);
});
test('Trying to get events if db fails should yield empty list', async () => {
    const db = (0, knex_1.default)({
        client: 'pg',
    });
    const store = new event_store_1.default(db, no_logger_1.default);
    const events = await store.getEvents();
    expect(events.length).toBe(0);
    await db.destroy();
});
test('Trying to get events by name if db fails should yield empty list', async () => {
    const db = (0, knex_1.default)({
        client: 'pg',
    });
    const store = new event_store_1.default(db, no_logger_1.default);
    const events = await store.deprecatedSearchEvents({
        type: 'application-created',
    });
    expect(events).toBeTruthy();
    expect(events.length).toBe(0);
    await db.destroy();
});
// We might want to cap this to 500 and this test can help checking that
test('Find unannounced events returns all events', async () => {
    const db = await (0, database_init_1.default)('events_test', no_logger_1.default);
    const type = 'application-created';
    const allEvents = Array.from({ length: 505 }).map((_, i) => ({
        type,
        created_at: (0, date_fns_1.formatRFC3339)((0, date_fns_1.subHours)(new Date(), i)),
        created_by: `test ${i}`,
        data: { name: 'test', iteration: i },
    }));
    await db.rawDatabase('events').insert(allEvents).returning(['id']);
    const store = new event_store_1.default(db.rawDatabase, no_logger_1.default);
    const events = await store.setUnannouncedToAnnounced();
    expect(events).toBeTruthy();
    expect(events.length).toBe(505);
    await db.destroy();
});
//# sourceMappingURL=event-store.test.js.map