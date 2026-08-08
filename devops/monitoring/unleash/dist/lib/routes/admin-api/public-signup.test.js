"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const store_1 = __importDefault(require("../../../test/fixtures/store"));
const test_config_1 = require("../../../test/config/test-config");
const services_1 = require("../../services");
const app_1 = __importDefault(require("../../app"));
const supertest_1 = __importDefault(require("supertest"));
const permissions_1 = __importDefault(require("../../../test/fixtures/permissions"));
const model_1 = require("../../types/model");
describe('Public Signup API', () => {
    async function getSetup() {
        const stores = (0, store_1.default)();
        const perms = (0, permissions_1.default)();
        const config = (0, test_config_1.createTestConfig)({
            preRouterHook: perms.hook,
        });
        stores.accessStore = {
            ...stores.accessStore,
            addUserToRole: jest.fn(),
            removeRolesOfTypeForUser: jest.fn(),
        };
        const services = (0, services_1.createServices)(stores, config);
        const app = await (0, app_1.default)(config, stores, services);
        await stores.roleStore.create({
            name: model_1.RoleName.VIEWER,
            roleType: model_1.RoleType.ROOT,
            description: '',
        });
        return {
            request: (0, supertest_1.default)(app),
            stores,
            perms,
        };
    }
    let stores;
    let request;
    const user = {
        username: 'some-username',
        email: 'someEmail@example.com',
        name: 'some-name',
        password: 'password',
    };
    beforeEach(async () => {
        const setup = await getSetup();
        stores = setup.stores;
        request = setup.request;
    });
    const expireAt = (addDays = 7) => {
        const now = new Date();
        now.setDate(now.getDate() + addDays);
        return now;
    };
    const createBody = () => ({
        name: 'some-name',
        expiresAt: expireAt(),
    });
    test('should create a token', async () => {
        const appName = '123!23';
        stores.clientApplicationsStore.upsert({ appName });
        stores.roleStore.create({
            description: '',
            roleType: '',
            name: model_1.RoleName.VIEWER,
        });
        const bodyCreate = createBody();
        const res = await request
            .post('/api/admin/invite-link/tokens')
            .send(bodyCreate)
            .expect(201);
        const token = res.body;
        expect(token.name).toBe(bodyCreate.name);
        expect(token.secret).not.toBeNull();
        expect(token.expiresAt).toBe(bodyCreate.expiresAt.toISOString());
        const eventCount = await stores.eventStore.count();
        expect(eventCount).toBe(1); //PUBLIC_SIGNUP_TOKEN_CREATED
    });
    test('should get All', async () => {
        expect.assertions(2);
        const appName = '123!23';
        await stores.clientApplicationsStore.upsert({ appName });
        await stores.publicSignupTokenStore.insert({
            roleId: 0,
            secret: '',
            url: '',
            name: 'some-name',
            expiresAt: expireAt(),
            createdBy: 'johnDoe',
        });
        return request
            .get('/api/admin/invite-link/tokens')
            .expect(200)
            .expect((res) => {
            const { tokens } = res.body;
            expect(tokens[0].name).toBe('some-name');
            expect(tokens[0].createdBy).toBe('johnDoe');
        });
    });
    test('should get token', async () => {
        expect.assertions(1);
        const appName = '123!23';
        stores.clientApplicationsStore.upsert({ appName });
        // @ts-expect-error - hacked in via fake store
        stores.publicSignupTokenStore.create({
            name: 'some-name',
            expiresAt: expireAt(),
        });
        return request
            .get('/api/admin/invite-link/tokens/some-secret')
            .expect(200)
            .expect((res) => {
            const token = res.body;
            expect(token.name).toBe('some-name');
        });
    });
    test('should expire token', async () => {
        expect.assertions(2);
        const appName = '123!23';
        stores.clientApplicationsStore.upsert({ appName });
        // @ts-expect-error - hacked in via fake store
        stores.publicSignupTokenStore.create({
            name: 'some-name',
            expiresAt: expireAt(),
        });
        const expireNow = expireAt(0);
        return request
            .put('/api/admin/invite-link/tokens/some-secret')
            .send({ expiresAt: expireNow.toISOString() })
            .expect(200)
            .expect(async (res) => {
            const token = res.body;
            expect(token.expiresAt).toBe(expireNow.toISOString());
            const eventCount = await stores.eventStore.count();
            expect(eventCount).toBe(1); // PUBLIC_SIGNUP_TOKEN_TOKEN_UPDATED
        });
    });
    test('should disable the token', async () => {
        expect.assertions(1);
        const appName = '123!23';
        stores.clientApplicationsStore.upsert({ appName });
        // @ts-expect-error - hacked in via fake store
        stores.publicSignupTokenStore.create({
            name: 'some-name',
            expiresAt: expireAt(),
        });
        return request
            .put('/api/admin/invite-link/tokens/some-secret')
            .send({ enabled: false })
            .expect(200)
            .expect(async (res) => {
            const token = res.body;
            expect(token.enabled).toBe(false);
        });
    });
    test('should not allow a user to register disabled token', async () => {
        const appName = '123!23';
        stores.clientApplicationsStore.upsert({ appName });
        // @ts-expect-error - hacked in via fake store
        stores.publicSignupTokenStore.create({
            name: 'some-name',
            expiresAt: expireAt(),
        });
        stores.publicSignupTokenStore.update('some-secret', { enabled: false });
        return request
            .post('/invite/some-secret/signup')
            .send(user)
            .expect(400);
    });
});
//# sourceMappingURL=public-signup.test.js.map