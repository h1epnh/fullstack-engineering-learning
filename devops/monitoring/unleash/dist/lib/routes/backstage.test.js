"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const services_1 = require("../services");
const test_config_1 = require("../../test/config/test-config");
const store_1 = __importDefault(require("../../test/fixtures/store"));
const app_1 = __importDefault(require("../app"));
test('should enable prometheus', async () => {
    expect.assertions(0);
    const stores = (0, store_1.default)();
    const config = (0, test_config_1.createTestConfig)();
    const services = (0, services_1.createServices)(stores, config);
    const app = await (0, app_1.default)(config, stores, services);
    const request = (0, supertest_1.default)(app);
    await request
        .get('/internal-backstage/prometheus')
        .expect('Content-Type', /text/)
        .expect(200);
});
//# sourceMappingURL=backstage.test.js.map