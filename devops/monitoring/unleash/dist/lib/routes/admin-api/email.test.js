"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const test_config_1 = require("../../../test/config/test-config");
const store_1 = __importDefault(require("../../../test/fixtures/store"));
const services_1 = require("../../services");
const permissions_1 = __importDefault(require("../../../test/fixtures/permissions"));
const app_1 = __importDefault(require("../../app"));
async function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = (0, store_1.default)();
    const perms = (0, permissions_1.default)();
    const config = (0, test_config_1.createTestConfig)({
        preHook: perms.hook,
        server: { baseUriPath: base },
    });
    const services = (0, services_1.createServices)(stores, config);
    const app = await (0, app_1.default)(config, stores, services);
    return {
        base,
        request: (0, supertest_1.default)(app),
    };
}
test('should render html preview of template', async () => {
    expect.assertions(0);
    const { request, base } = await getSetup();
    return request
        .get(`${base}/api/admin/email/preview/html/reset-password?name=Test%20Test`)
        .expect('Content-Type', /html/)
        .expect(200)
        .expect((res) => 'Test Test' in res.body);
});
test('should render text preview of template', async () => {
    expect.assertions(0);
    const { request, base } = await getSetup();
    return request
        .get(`${base}/api/admin/email/preview/text/reset-password?name=Test%20Test`)
        .expect('Content-Type', /plain/)
        .expect(200)
        .expect((res) => 'Test Test' in res.body);
});
test('Requesting a non-existing template should yield 404', async () => {
    expect.assertions(0);
    const { request, base } = await getSetup();
    return request
        .get(`${base}/api/admin/email/preview/text/some-non-existing-template`)
        .expect(404);
});
//# sourceMappingURL=email.test.js.map