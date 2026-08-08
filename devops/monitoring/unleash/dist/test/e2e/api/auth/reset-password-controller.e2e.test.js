"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
const test_config_1 = require("../../../config/test-config");
const user_service_1 = __importDefault(require("../../../../lib/services/user-service"));
const access_service_1 = require("../../../../lib/services/access-service");
const reset_token_service_1 = __importDefault(require("../../../../lib/services/reset-token-service"));
const test_helper_1 = require("../../helpers/test-helper");
const database_init_1 = __importDefault(require("../../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../fixtures/no-logger"));
const email_service_1 = require("../../../../lib/services/email-service");
const session_store_1 = __importDefault(require("../../../../lib/db/session-store"));
const session_service_1 = __importDefault(require("../../../../lib/services/session-service"));
const model_1 = require("../../../../lib/types/model");
const setting_service_1 = __importDefault(require("../../../../lib/services/setting-service"));
const fake_setting_store_1 = __importDefault(require("../../../fixtures/fake-setting-store"));
const group_service_1 = require("../../../../lib/services/group-service");
const types_1 = require("../../../../lib/types");
const features_1 = require("../../../../lib/features");
let app;
let stores;
let db;
const config = (0, test_config_1.createTestConfig)({
    getLogger: no_logger_1.default,
    server: {
        unleashUrl: 'http://localhost:3000',
        baseUriPath: '',
    },
    email: {
        host: 'test',
    },
});
const password = 'DtUYwi&l5I1KX4@Le';
let userService;
let accessService;
let resetTokenService;
let adminUser;
let user;
const getBackendResetUrl = (url) => {
    const urlString = url.toString();
    const params = urlString.substring(urlString.indexOf('?'));
    return `/auth/reset/validate${params}`;
};
beforeAll(async () => {
    db = await (0, database_init_1.default)('reset_password_api_serial', no_logger_1.default);
    stores = db.stores;
    app = await (0, test_helper_1.setupApp)(stores);
    const eventService = (0, features_1.createEventsService)(db.rawDatabase, config);
    const groupService = new group_service_1.GroupService(stores, config, eventService);
    accessService = new access_service_1.AccessService(stores, config, groupService, eventService);
    const emailService = new email_service_1.EmailService(config);
    const sessionStore = new session_store_1.default(db.rawDatabase, new events_1.default(), config.getLogger);
    const sessionService = new session_service_1.default({ sessionStore }, config);
    const settingService = new setting_service_1.default({
        settingStore: new fake_setting_store_1.default(),
    }, config, eventService);
    userService = new user_service_1.default(stores, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
    });
    resetTokenService = new reset_token_service_1.default(stores, config);
    const adminRole = (await accessService.getPredefinedRole(model_1.RoleName.ADMIN));
    adminUser = await userService.createUser({
        username: 'admin@test.com',
        rootRole: adminRole.id,
    }, types_1.TEST_AUDIT_USER);
    const userRole = (await accessService.getPredefinedRole(model_1.RoleName.EDITOR));
    user = await userService.createUser({
        username: 'test@test.com',
        email: 'test@test.com',
        rootRole: userRole.id,
    }, types_1.TEST_AUDIT_USER);
});
afterAll(async () => {
    await stores.resetTokenStore.deleteAll();
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});
test('Can validate token for password reset', async () => {
    const url = await resetTokenService.createResetPasswordUrl(user.id, adminUser.username);
    const relative = getBackendResetUrl(url);
    return app.request
        .get(relative)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
        expect(res.body.email).toBe(user.email);
    });
});
test('Can use token to reset password', async () => {
    const url = await resetTokenService.createResetPasswordUrl(user.id, adminUser.username);
    const relative = getBackendResetUrl(url);
    // Can't login before reset
    await expect(async () => userService.loginUser(user.email, password)).rejects.toThrow(Error);
    let token;
    await app.request
        .get(relative)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
        token = res.body.token;
    });
    await app.request
        .post('/auth/reset/password')
        .send({
        token,
        password,
    })
        .expect(200);
    const loggedInUser = await userService.loginUser(user.email, password);
    expect(user.email).toBe(loggedInUser.email);
});
test('Trying to reset password with same token twice does not work', async () => {
    const url = await resetTokenService.createResetPasswordUrl(user.id, adminUser.username);
    const relative = getBackendResetUrl(url);
    let token;
    await app.request
        .get(relative)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
        token = res.body.token;
    });
    await app.request
        .post('/auth/reset/password')
        .send({
        token,
        password: `${password}test`,
    })
        .expect(200);
    await app.request
        .post('/auth/reset/password')
        .send({
        token,
        password: `${password}othertest`,
    })
        .expect(401)
        .expect((res) => {
        expect(res.body.details[0].message).toBeTruthy();
    });
});
test('Invalid token should yield 401', async () => app.request.get('/auth/reset/validate?token=abc123').expect((res) => {
    expect(res.status).toBe(401);
}));
test('Calling validate endpoint with already existing session should destroy session', async () => {
    expect.assertions(0);
    const { request, destroy } = await (0, test_helper_1.setupAppWithAuth)(stores);
    await request
        .post('/auth/demo/login')
        .send({
        email: 'user@mail.com',
    })
        .expect(200);
    await request.get('/api/admin/projects').expect(200);
    const url = await resetTokenService.createResetPasswordUrl(user.id, adminUser.username);
    const relative = getBackendResetUrl(url);
    await request.get(relative).expect(200).expect('Content-Type', /json/);
    await request.get('/api/admin/projects').expect(401); // we no longer should have a valid session
    await destroy();
});
test('Calling reset endpoint with already existing session should logout/destroy existing session', async () => {
    expect.assertions(0);
    const { request, destroy } = await (0, test_helper_1.setupAppWithAuth)(stores);
    const url = await resetTokenService.createResetPasswordUrl(user.id, adminUser.username);
    const relative = getBackendResetUrl(url);
    let token;
    await request
        .get(relative)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
        token = res.body.token;
    });
    await request
        .post('/auth/demo/login')
        .send({
        email: 'user@mail.com',
    })
        .expect(200);
    await request.get('/api/admin/projects').expect(200); // If we login we can access projects endpoint
    await request
        .post('/auth/reset/password')
        .send({
        token,
        password: `${password}newpassword`,
    })
        .expect(200);
    await request.get('/api/admin/projects').expect(401); // we no longer have a valid session after using the reset password endpoint
    await destroy();
});
test('Trying to change password with an invalid token should yield 401', async () => app.request
    .post('/auth/reset/password')
    .send({
    token: 'abc123',
    password,
})
    .expect((res) => expect(res.status).toBe(401)));
test('Trying to change password to undefined should yield 400 without crashing the server', async () => {
    expect.assertions(0);
    const url = await resetTokenService.createResetPasswordUrl(user.id, adminUser.username);
    const relative = getBackendResetUrl(url);
    let token;
    await app.request
        .get(relative)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
        token = res.body.token;
    });
    await app.request
        .post('/auth/reset/password')
        .send({
        token,
        password: undefined,
    })
        .expect(400);
});
test('changing password should expire all active tokens', async () => {
    const url = await resetTokenService.createResetPasswordUrl(user.id, adminUser.username);
    const relative = getBackendResetUrl(url);
    const { body: { token }, } = await app.request
        .get(relative)
        .expect(200)
        .expect('Content-Type', /json/);
    await app.request
        .post(`/api/admin/user-admin/${user.id}/change-password`)
        .send({ password: 'simple123-_ASsad' })
        .expect(200);
    await app.request
        .post('/auth/reset/password')
        .send({
        token,
        password,
    })
        .expect(401);
});
//# sourceMappingURL=reset-password-controller.e2e.test.js.map