"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const no_logger_1 = __importDefault(require("../../fixtures/no-logger"));
const database_init_1 = __importDefault(require("../helpers/database-init"));
const session_service_1 = __importDefault(require("../../../lib/services/session-service"));
const notfound_error_1 = __importDefault(require("../../../lib/error/notfound-error"));
const date_fns_1 = require("date-fns");
let stores;
let db;
let sessionService;
const newSession = {
    sid: 'abc123',
    sess: {
        cookie: {
            originalMaxAge: (0, date_fns_1.minutesToMilliseconds)(48),
            expires: (0, date_fns_1.addDays)(Date.now(), 1).toDateString(),
            secure: false,
            httpOnly: true,
            path: '/',
        },
        user: {
            id: 1,
            username: 'admin',
            imageUrl: 'https://gravatar.com/avatar/21232f297a57a5a743894a0e4a801fc3?size=42&default=retro',
            seenAt: '2021-04-26T10:59:18.782Z',
            loginAttempts: 0,
            createdAt: '2021-04-22T05:12:54.368Z',
        },
    },
};
const otherSession = {
    sid: 'xyz321',
    sess: {
        cookie: {
            originalMaxAge: (0, date_fns_1.minutesToMilliseconds)(48),
            expires: (0, date_fns_1.addDays)(Date.now(), 1).toDateString(),
            secure: false,
            httpOnly: true,
            path: '/',
        },
        user: {
            id: 2,
            username: 'editor',
            imageUrl: 'https://gravatar.com/avatar/21232f297a57a5a743894a0e4a801fc3?size=42&default=retro',
            seenAt: '2021-04-26T10:59:18.782Z',
            loginAttempts: 0,
            createdAt: '2021-04-22T05:12:54.368Z',
        },
    },
};
beforeAll(async () => {
    db = await (0, database_init_1.default)('session_service_serial', no_logger_1.default);
    stores = db.stores;
    sessionService = new session_service_1.default(stores, {
        getLogger: no_logger_1.default,
    });
});
beforeEach(async () => {
    await db.stores.sessionStore.deleteAll();
});
afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});
test('should list active sessions', async () => {
    await sessionService.insertSession(newSession);
    await sessionService.insertSession(otherSession);
    const sessions = await sessionService.getActiveSessions();
    expect(sessions.length).toBe(2);
    expect(sessions[0].sess).toEqual(otherSession.sess); // Ordered newest first
    expect(sessions[1].sess).toEqual(newSession.sess);
});
test('Should list active sessions for user', async () => {
    await sessionService.insertSession(newSession);
    await sessionService.insertSession(otherSession);
    const sessions = await sessionService.getSessionsForUser(2); // editor session
    expect(sessions.length).toBe(1);
    expect(sessions[0].sess).toEqual(otherSession.sess);
});
test('Can delete sessions by user', async () => {
    await sessionService.insertSession(newSession);
    await sessionService.insertSession(otherSession);
    const sessions = await sessionService.getActiveSessions();
    expect(sessions.length).toBe(2);
    await sessionService.deleteSessionsForUser(2);
    const noSessions = await sessionService.getSessionsForUser(2);
    expect(noSessions.length).toBe(0);
});
test('Can delete session by sid', async () => {
    await sessionService.insertSession(newSession);
    await sessionService.insertSession(otherSession);
    const sessions = await sessionService.getActiveSessions();
    expect(sessions.length).toBe(2);
    await sessionService.deleteSession('abc123');
    await expect(async () => sessionService.getSession('abc123')).rejects.toThrow(notfound_error_1.default);
});
test('Can delete stale sessions', async () => {
    await sessionService.insertSession(newSession);
    await sessionService.insertSession({ ...newSession, sid: 'new' });
    const sessionsToKeep = 1;
    await sessionService.deleteStaleSessionsForUser(newSession.sess.user.id, sessionsToKeep);
    const sessions = await sessionService.getSessionsForUser(1);
    expect(sessions.length).toBe(1);
    expect(sessions[0].sid).toBe('new');
});
//# sourceMappingURL=session-service.e2e.test.js.map