"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const test_config_1 = require("../../test/config/test-config");
const logout_1 = __importDefault(require("./logout"));
const session_service_1 = __importDefault(require("../services/session-service"));
const fake_session_store_1 = __importDefault(require("../../test/fixtures/fake-session-store"));
const no_logger_1 = __importDefault(require("../../test/fixtures/no-logger"));
const date_fns_1 = require("date-fns");
test('should redirect to "/" after logout', async () => {
    const baseUriPath = '';
    const app = (0, express_1.default)();
    const config = (0, test_config_1.createTestConfig)({ server: { baseUriPath } });
    const sessionStore = new fake_session_store_1.default();
    const sessionService = new session_service_1.default({ sessionStore }, { getLogger: no_logger_1.default });
    app.use('/logout', new logout_1.default(config, {
        sessionService,
    }).router);
    const request = (0, supertest_1.default)(app);
    expect.assertions(0);
    await request
        .post(`${baseUriPath}/logout`)
        .expect(302)
        .expect('Location', `${baseUriPath}/`);
});
test('should redirect to "/basePath" after logout when baseUriPath is set', async () => {
    const baseUriPath = '/basePath';
    const app = (0, express_1.default)();
    const config = (0, test_config_1.createTestConfig)({ server: { baseUriPath } });
    const sessionStore = new fake_session_store_1.default();
    const sessionService = new session_service_1.default({ sessionStore }, { getLogger: no_logger_1.default });
    app.use('/logout', new logout_1.default(config, { sessionService }).router);
    const request = (0, supertest_1.default)(app);
    expect.assertions(0);
    await request
        .post('/logout')
        .expect(302)
        .expect('Location', `${baseUriPath}/`);
});
test('should set "Clear-Site-Data" header', async () => {
    const baseUriPath = '';
    const app = (0, express_1.default)();
    const config = (0, test_config_1.createTestConfig)({ server: { baseUriPath } });
    const sessionStore = new fake_session_store_1.default();
    const sessionService = new session_service_1.default({ sessionStore }, { getLogger: no_logger_1.default });
    app.use('/logout', new logout_1.default(config, { sessionService }).router);
    const request = (0, supertest_1.default)(app);
    expect.assertions(0);
    await request
        .post(`${baseUriPath}/logout`)
        .expect(302)
        .expect('Clear-Site-Data', '"cookies", "storage"');
});
test('should not set "Clear-Site-Data" header', async () => {
    const baseUriPath = '';
    const app = (0, express_1.default)();
    const config = (0, test_config_1.createTestConfig)({
        server: { baseUriPath },
        session: { clearSiteDataOnLogout: false },
    });
    const sessionStore = new fake_session_store_1.default();
    const sessionService = new session_service_1.default({ sessionStore }, { getLogger: no_logger_1.default });
    app.use('/logout', new logout_1.default(config, { sessionService }).router);
    const request = (0, supertest_1.default)(app);
    expect.assertions(1);
    await request
        .post(`${baseUriPath}/logout`)
        .expect(302)
        .expect((res) => expect(res.headers['Clear-Site-Data']).toBeUndefined());
});
test('should clear "unleash-session" cookies', async () => {
    const baseUriPath = '';
    const app = (0, express_1.default)();
    const config = (0, test_config_1.createTestConfig)({ server: { baseUriPath } });
    const sessionStore = new fake_session_store_1.default();
    const sessionService = new session_service_1.default({ sessionStore }, { getLogger: no_logger_1.default });
    app.use('/logout', new logout_1.default(config, { sessionService }).router);
    const request = (0, supertest_1.default)(app);
    expect.assertions(0);
    await request
        .post(`${baseUriPath}/logout`)
        .expect(302)
        .expect('Set-Cookie', 'unleash-session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
});
test('should clear "unleash-session" cookie even when disabled clear site data', async () => {
    const baseUriPath = '';
    const app = (0, express_1.default)();
    const config = (0, test_config_1.createTestConfig)({
        server: { baseUriPath },
        session: { clearSiteDataOnLogout: false },
    });
    const sessionStore = new fake_session_store_1.default();
    const sessionService = new session_service_1.default({ sessionStore }, { getLogger: no_logger_1.default });
    app.use('/logout', new logout_1.default(config, { sessionService }).router);
    const request = (0, supertest_1.default)(app);
    expect.assertions(0);
    await request
        .post(`${baseUriPath}/logout`)
        .expect(302)
        .expect('Set-Cookie', 'unleash-session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
});
test('should call destroy on session', async () => {
    const baseUriPath = '';
    const fakeSession = {
        destroy: jest.fn(),
    };
    const app = (0, express_1.default)();
    const config = (0, test_config_1.createTestConfig)({ server: { baseUriPath } });
    app.use((req, res, next) => {
        req.session = fakeSession;
        next();
    });
    const sessionStore = new fake_session_store_1.default();
    const sessionService = new session_service_1.default({ sessionStore }, { getLogger: no_logger_1.default });
    app.use('/logout', new logout_1.default(config, { sessionService }).router);
    const request = (0, supertest_1.default)(app);
    await request.post(`${baseUriPath}/logout`);
    expect(fakeSession.destroy.mock.calls.length).toBe(1);
});
test('should handle req.logout with callback function', async () => {
    // passport >=0.6.0
    const baseUriPath = '';
    const logoutFunction = jest.fn((cb) => cb());
    const app = (0, express_1.default)();
    const config = (0, test_config_1.createTestConfig)({ server: { baseUriPath } });
    app.use((req, res, next) => {
        req.logout = logoutFunction;
        next();
    });
    const sessionStore = new fake_session_store_1.default();
    const sessionService = new session_service_1.default({ sessionStore }, { getLogger: no_logger_1.default });
    app.use('/logout', new logout_1.default(config, { sessionService }).router);
    const request = (0, supertest_1.default)(app);
    await request.post(`${baseUriPath}/logout`);
    expect(logoutFunction).toHaveBeenCalledTimes(1);
    expect(logoutFunction).toHaveBeenCalledWith(expect.anything());
});
test('should handle req.logout without callback function', async () => {
    // passport <0.6.0
    const baseUriPath = '';
    const logoutFunction = jest.fn();
    const app = (0, express_1.default)();
    const config = (0, test_config_1.createTestConfig)({ server: { baseUriPath } });
    app.use((req, res, next) => {
        req.logout = logoutFunction;
        next();
    });
    const sessionStore = new fake_session_store_1.default();
    const sessionService = new session_service_1.default({ sessionStore }, { getLogger: no_logger_1.default });
    app.use('/logout', new logout_1.default(config, { sessionService }).router);
    const request = (0, supertest_1.default)(app);
    await request.post(`${baseUriPath}/logout`);
    expect(logoutFunction).toHaveBeenCalledTimes(1);
    expect(logoutFunction).toHaveBeenCalledWith();
});
test('should redirect to alternative logoutUrl', async () => {
    const fakeSession = {
        destroy: jest.fn(),
        logoutUrl: '/some-other-path',
    };
    const app = (0, express_1.default)();
    const config = (0, test_config_1.createTestConfig)();
    app.use((req, res, next) => {
        req.session = fakeSession;
        next();
    });
    const sessionStore = new fake_session_store_1.default();
    const sessionService = new session_service_1.default({ sessionStore }, { getLogger: no_logger_1.default });
    app.use('/logout', new logout_1.default(config, { sessionService }).router);
    const request = (0, supertest_1.default)(app);
    await request
        .post('/logout')
        .expect(302)
        .expect('Location', '/some-other-path');
});
test('Should destroy sessions for user', async () => {
    const app = (0, express_1.default)();
    const config = (0, test_config_1.createTestConfig)();
    const fakeSession = {
        destroy: jest.fn(),
        user: {
            id: 1,
        },
    };
    app.use((req, res, next) => {
        req.session = fakeSession;
        next();
    });
    const sessionStore = new fake_session_store_1.default();
    const sessionService = new session_service_1.default({ sessionStore }, { getLogger: no_logger_1.default });
    await sessionStore.insertSession({
        sid: '1',
        sess: {
            user: {
                id: 1,
            },
        },
        expired: (0, date_fns_1.addDays)(new Date(), 2),
    });
    await sessionStore.insertSession({
        sid: '2',
        sess: {
            user: {
                id: 1,
            },
        },
        expired: (0, date_fns_1.addDays)(new Date(), 2),
    });
    const activeSessionsBeforeLogout = await sessionStore.getSessionsForUser(1);
    expect(activeSessionsBeforeLogout).toHaveLength(2);
    app.use('/logout', new logout_1.default(config, { sessionService }).router);
    await (0, supertest_1.default)(app).post('/logout').expect(302);
    const activeSessions = await sessionStore.getSessionsForUser(1);
    expect(activeSessions).toHaveLength(0);
});
//# sourceMappingURL=logout.test.js.map