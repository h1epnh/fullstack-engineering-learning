"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../test/e2e/helpers/database-init"));
const server_impl_1 = require("../server-impl");
const test_helper_1 = require("../../test/e2e/helpers/test-helper");
let db;
let stores;
beforeAll(async () => {
    db = await (0, database_init_1.default)('demo_auth_serial');
    stores = db.stores;
});
afterAll(async () => {
    await db?.destroy();
});
const getApp = (adminLoginEnabled) => (0, test_helper_1.setupAppWithCustomAuth)(stores, () => { }, {
    authentication: {
        demoAllowAdminLogin: adminLoginEnabled,
        type: server_impl_1.IAuthType.DEMO,
        createAdminUser: true,
    },
});
test('the demoAllowAdminLogin flag should not affect regular user login/creation', async () => {
    const app = await getApp(true);
    return app.request
        .post(`/auth/demo/login`)
        .send({ email: 'test@example.com' })
        .expect(200)
        .expect((res) => {
        expect(res.body.email).toBe('test@example.com');
        expect(res.body.id).not.toBe(1);
    });
});
test('if the demoAllowAdminLogin flag is disabled, using `admin` should have the same result as any other invalid email', async () => {
    const app = await getApp(false);
    const nonAdminUsername = 'not-an-email';
    const adminUsername = 'admin';
    const nonAdminUser = await app.request
        .post(`/auth/demo/login`)
        .send({ email: nonAdminUsername });
    const adminUser = await app.request
        .post(`/auth/demo/login`)
        .send({ email: adminUsername });
    expect(nonAdminUser.status).toBe(adminUser.status);
    for (const user of [nonAdminUser, adminUser]) {
        expect(user.body).toMatchObject({
            error: expect.stringMatching(/^Could not sign in with /),
        });
    }
});
test('should allow you to login as admin if the demoAllowAdminLogin flag enabled', async () => {
    const app = await getApp(true);
    return app.request
        .post(`/auth/demo/login`)
        .send({ email: 'admin' })
        .expect(200)
        .expect((res) => {
        expect(res.body.id).toBe(1);
        expect(res.body.username).toBe('admin');
    });
});
//# sourceMappingURL=demo-authentication.e2e.test.js.map