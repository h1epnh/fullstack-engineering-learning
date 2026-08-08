"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../helpers/database-init"));
const test_helper_1 = require("../../helpers/test-helper");
const no_logger_1 = __importDefault(require("../../../fixtures/no-logger"));
const simple_auth_settings_1 = require("../../../../lib/types/settings/simple-auth-settings");
const types_1 = require("../../../../lib/types");
const date_fns_1 = require("date-fns");
let db;
let app;
beforeAll(async () => {
    db = await (0, database_init_1.default)('config_api_serial', no_logger_1.default);
    app = await (0, test_helper_1.setupAppWithCustomConfig)(db.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
    }, db.rawDatabase);
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});
beforeEach(async () => {
    await app.services.settingService.deleteAll();
});
test('gets ui config fields', async () => {
    const { body } = await app.request
        .get('/api/admin/ui-config')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(body.unleashUrl).toBe('http://localhost:4242');
    expect(body.version).toBeDefined();
    expect(body.emailEnabled).toBe(false);
});
test('gets ui config with disablePasswordAuth', async () => {
    await db.stores.settingStore.insert(simple_auth_settings_1.simpleAuthSettingsKey, {
        disabled: true,
    });
    const { body } = await app.request
        .get('/api/admin/ui-config')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(body.disablePasswordAuth).toBe(true);
});
test('gets ui config with frontendSettings', async () => {
    const frontendApiOrigins = ['https://example.net'];
    await app.services.frontendApiService.setFrontendSettings({ frontendApiOrigins }, types_1.TEST_AUDIT_USER);
    await app.request
        .get('/api/admin/ui-config')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => expect(res.body.frontendApiOrigins).toEqual(frontendApiOrigins));
});
test('sets ui config with frontendSettings', async () => {
    const frontendApiOrigins = ['https://example.org'];
    await app.request
        .get('/api/admin/ui-config')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => expect(res.body.frontendApiOrigins).toEqual(['*']));
    await app.request
        .post('/api/admin/ui-config')
        .send({ frontendSettings: { frontendApiOrigins: [] } })
        .expect(204);
    await app.request
        .get('/api/admin/ui-config')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => expect(res.body.frontendApiOrigins).toEqual([]));
    await app.request
        .post('/api/admin/ui-config')
        .send({ frontendSettings: { frontendApiOrigins } })
        .expect(204);
    await app.request
        .get('/api/admin/ui-config')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => expect(res.body.frontendApiOrigins).toEqual(frontendApiOrigins));
});
describe('maxSessionsCount', () => {
    beforeEach(async () => {
        // prevent memoization of session count
        await app?.destroy();
        app = await (0, test_helper_1.setupAppWithCustomConfig)(db.stores, {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                    showUserDeviceCount: true,
                },
            },
        }, db.rawDatabase);
    });
    test('should return max sessions count', async () => {
        const { body: noLoggedInUsers } = await app.request
            .get(`/api/admin/ui-config`)
            .expect('Content-Type', /json/)
            .expect(200);
        expect(noLoggedInUsers.maxSessionsCount).toEqual(0);
    });
    test('should count number of session per user', async () => {
        const email = 'user@getunleash.io';
        const adminRole = (await db.stores.roleStore.getRootRoles()).find((r) => r.name === types_1.RoleName.ADMIN);
        const user = await app.services.userService.createUser({
            email,
            password: 'test password',
            rootRole: adminRole.id,
        }, types_1.TEST_AUDIT_USER);
        const userSession = (index) => ({
            sid: `sid${index}`,
            sess: {
                cookie: {
                    originalMaxAge: (0, date_fns_1.minutesToMilliseconds)(48),
                    expires: (0, date_fns_1.addDays)(Date.now(), 1).toDateString(),
                    secure: false,
                    httpOnly: true,
                    path: '/',
                },
                user,
            },
        });
        for (let i = 0; i < 5; i++) {
            await app.services.sessionService.insertSession(userSession(i));
        }
        const { body: withSessions } = await app.request
            .get(`/api/admin/ui-config`)
            .expect('Content-Type', /json/)
            .expect(200);
        expect(withSessions.maxSessionsCount).toEqual(5);
    });
});
//# sourceMappingURL=config.e2e.test.js.map