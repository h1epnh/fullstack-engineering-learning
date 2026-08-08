"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const store_1 = __importDefault(require("../../../test/fixtures/store"));
const permissions_1 = __importDefault(require("../../../test/fixtures/permissions"));
const app_1 = __importDefault(require("../../app"));
const test_config_1 = require("../../../test/config/test-config");
const services_1 = require("../../services");
async function getSetup() {
    const stores = (0, store_1.default)();
    const perms = (0, permissions_1.default)();
    const config = (0, test_config_1.createTestConfig)({
        preRouterHook: perms.hook,
    });
    const services = (0, services_1.createServices)(stores, config);
    const app = await (0, app_1.default)(config, stores, services);
    return {
        request: (0, supertest_1.default)(app),
        stores,
        perms,
        config,
    };
}
let stores;
let request;
beforeEach(async () => {
    const setup = await getSetup();
    stores = setup.stores;
    request = setup.request;
});
test('/api/admin/metrics/seen-toggles is deprecated', () => {
    return request.get('/api/admin/metrics/seen-toggles').expect(410);
});
test('/api/admin/metrics/feature-toggles is deprecated', () => {
    return request.get('/api/admin/metrics/feature-toggles').expect(410);
});
test('should return empty list of client applications', () => {
    return request
        .get('/api/admin/metrics/applications')
        .expect(200)
        .expect((res) => {
        expect(res.body.applications.length === 0).toBe(true);
    });
});
test('should return applications', () => {
    expect.assertions(2);
    const appName = '123!23';
    stores.clientApplicationsStore.upsert({ appName });
    return request
        .get('/api/admin/metrics/applications/')
        .expect(200)
        .expect((res) => {
        const metrics = res.body;
        expect(metrics.applications.length === 1).toBe(true);
        expect(metrics.applications[0].appName === appName).toBe(true);
    });
});
test('should store application', () => {
    expect.assertions(0);
    const appName = '123!23';
    return request
        .post(`/api/admin/metrics/applications/${appName}`)
        .send({ appName, strategies: ['default'] })
        .expect(202);
});
test('should store application coming from edit application form', () => {
    expect.assertions(0);
    const appName = '123!23';
    return request
        .post(`/api/admin/metrics/applications/${appName}`)
        .send({
        url: 'http://test.com',
        description: 'This is an optional description',
        icon: 'arrow-down',
    })
        .expect(202);
});
test('should store application details without strategies', () => {
    expect.assertions(0);
    const appName = '123!23';
    return request
        .post(`/api/admin/metrics/applications/${appName}`)
        .send({ appName, url: 'htto://asd.com' })
        .expect(202);
});
test('should accept a delete call to unknown application', () => {
    expect.assertions(0);
    const appName = 'unknown';
    return request
        .delete(`/api/admin/metrics/applications/${appName}`)
        .expect(200);
});
test('should delete application', () => {
    expect.assertions(0);
    const appName = 'deletable-test';
    stores.clientApplicationsStore.upsert({ appName });
    return request
        .delete(`/api/admin/metrics/applications/${appName}`)
        .expect(200);
});
//# sourceMappingURL=metrics.test.js.map