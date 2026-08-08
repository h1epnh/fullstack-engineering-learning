"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const services_1 = require("../services");
const test_config_1 = require("../../test/config/test-config");
const store_1 = __importDefault(require("../../test/fixtures/store"));
const no_logger_1 = __importDefault(require("../../test/fixtures/no-logger"));
const app_1 = __importDefault(require("../app"));
async function getSetup() {
    const stores = (0, store_1.default)();
    const config = (0, test_config_1.createTestConfig)();
    const services = (0, services_1.createServices)(stores, config);
    const app = await (0, app_1.default)(config, stores, services);
    return {
        request: (0, supertest_1.default)(app),
        stores,
    };
}
let request;
beforeEach(async () => {
    const setup = await getSetup();
    request = setup.request;
});
afterEach(() => {
    no_logger_1.default.setMuteError(false);
});
test('should give 200 when ready', async () => {
    await request.get('/health').expect(200);
});
test('should give health=GOOD  when ready', async () => {
    expect.assertions(2);
    await request
        .get('/health')
        .expect(200)
        .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body.health).toBe('GOOD');
    });
});
//# sourceMappingURL=health-check.test.js.map