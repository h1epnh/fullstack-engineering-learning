"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("../../../test/fixtures/permissions"));
const test_config_1 = require("../../../test/config/test-config");
const store_1 = __importDefault(require("../../../test/fixtures/store"));
const services_1 = require("../../services");
const app_1 = __importDefault(require("../../app"));
const supertest_1 = __importDefault(require("supertest"));
const date_fns_1 = require("date-fns");
async function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const perms = (0, permissions_1.default)();
    const config = (0, test_config_1.createTestConfig)({
        preHook: perms.hook,
        server: { baseUriPath: base },
        //@ts-ignore - Just testing, so only need the isEnabled call here
    });
    const stores = (0, store_1.default)();
    const services = (0, services_1.createServices)(stores, config);
    //@ts-expect-error: we're accessing a private field, but we need
    //to set up an environment to test the functionality. Because we
    //don't have a db to use, we need to access the service's store
    //directly.
    await services.apiTokenService.environmentStore.create({
        name: 'development',
        type: 'development',
        enabled: true,
    });
    const app = await (0, app_1.default)(config, stores, services);
    return {
        base,
        request: (0, supertest_1.default)(app),
    };
}
describe('Admin token killswitch', () => {
    test('If killswitch is on we will get an operation denied if we try to create an admin token', async () => {
        const setup = await getSetup();
        return setup.request
            .post(`${setup.base}/api/admin/api-tokens`)
            .set('Content-Type', 'application/json')
            .send({
            expiresAt: (0, date_fns_1.addDays)(new Date(), 60),
            type: 'ADMIN',
            tokenName: 'Killswitched',
        })
            .expect(403)
            .expect((res) => {
            expect(res.body.message).toBe('Admin tokens are disabled in this instance. Use a Service account or a PAT to access admin operations instead');
        });
    });
    test('If killswitch is on we can still create a client token', async () => {
        const setup = await getSetup();
        return setup.request
            .post(`${setup.base}/api/admin/api-tokens`)
            .set('Content-Type', 'application/json')
            .send({
            expiresAt: (0, date_fns_1.addDays)(new Date(), 60),
            type: 'CLIENT',
            environment: 'development',
            projects: ['*'],
            tokenName: 'Client',
        })
            .expect(201)
            .expect((res) => {
            expect(res.body.secret).toBeTruthy();
        });
    });
    test('If killswitch is on we can still create a frontend token', async () => {
        const setup = await getSetup();
        return setup.request
            .post(`${setup.base}/api/admin/api-tokens`)
            .set('Content-Type', 'application/json')
            .send({
            expiresAt: (0, date_fns_1.addDays)(new Date(), 60),
            type: 'FRONTEND',
            environment: 'development',
            projects: ['*'],
            tokenName: 'Frontend',
        })
            .expect(201)
            .expect((res) => {
            expect(res.body.secret).toBeTruthy();
        });
    });
});
//# sourceMappingURL=api-token.test.js.map