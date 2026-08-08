"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const services_1 = require("../../../services");
const test_config_1 = require("../../../../test/config/test-config");
const store_1 = __importDefault(require("../../../../test/fixtures/store"));
const app_1 = __importDefault(require("../../../app"));
const user_1 = __importDefault(require("../../../types/user"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const currentUser = new user_1.default({ id: 1337, email: 'test@mail.com' });
const oldPassword = 'old-pass';
async function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = (0, store_1.default)();
    await stores.userStore.insert(currentUser);
    await stores.userStore.setPasswordHash(currentUser.id, await bcryptjs_1.default.hash(oldPassword, 10), 5);
    const config = (0, test_config_1.createTestConfig)({
        preHook: (a) => {
            a.use((req, res, next) => {
                req.user = currentUser;
                next();
            });
        },
        server: { baseUriPath: base },
    });
    const services = (0, services_1.createServices)(stores, config);
    const app = await (0, app_1.default)(config, stores, services);
    return {
        base,
        userStore: stores.userStore,
        sessionStore: stores.sessionStore,
        request: (0, supertest_1.default)(app),
    };
}
test('should return current user', async () => {
    expect.assertions(1);
    const { request, base } = await getSetup();
    return request
        .get(`${base}/api/admin/user`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
        expect(res.body.user.email).toBe(currentUser.email);
    });
});
const owaspPassword = 't7GTx&$Y9pcsnxRv6';
test('should return current profile', async () => {
    expect.assertions(1);
    const { request, base } = await getSetup();
    return request
        .get(`${base}/api/admin/user/profile`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
        expect(res.body).toMatchObject({
            projects: [],
            rootRole: { id: -1, name: 'Viewer', type: 'root' },
            subscriptions: ['productivity-report'],
            features: [],
        });
    });
});
test('should allow user to change password', async () => {
    const { request, base, userStore } = await getSetup();
    await request
        .post(`${base}/api/admin/user/change-password`)
        .send({
        password: owaspPassword,
        confirmPassword: owaspPassword,
        oldPassword,
    })
        .expect(200);
    const updated = await userStore.get(currentUser.id);
    // @ts-ignore
    expect(updated.passwordHash).toBeTruthy();
});
test('should not allow user to change password with incorrect old password', async () => {
    const { request, base } = await getSetup();
    await request
        .post(`${base}/api/admin/user/change-password`)
        .send({
        password: owaspPassword,
        confirmPassword: owaspPassword,
        oldPassword: 'incorrect',
    })
        .expect(401);
});
test('should not allow user to change password without providing old password', async () => {
    const { request, base } = await getSetup();
    await request
        .post(`${base}/api/admin/user/change-password`)
        .send({
        password: owaspPassword,
        confirmPassword: owaspPassword,
    })
        .expect(400);
});
test('should deny if password and confirmPassword are not equal', async () => {
    expect.assertions(0);
    const { request, base } = await getSetup();
    return request
        .post(`${base}/api/admin/user/change-password`)
        .send({ password: owaspPassword, confirmPassword: 'somethingelse' })
        .expect(400);
});
test('should deny if password does not fulfill owasp criteria', async () => {
    expect.assertions(0);
    const { request, base } = await getSetup();
    return request
        .post(`${base}/api/admin/user/change-password`)
        .send({ password: 'hunter123', confirmPassword: 'hunter123' })
        .expect(400);
});
//# sourceMappingURL=user.test.js.map