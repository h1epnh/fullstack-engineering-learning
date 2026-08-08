"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fast_check_1 = __importDefault(require("fast-check"));
const supertest_1 = __importDefault(require("supertest"));
const services_1 = require("../../services");
const test_config_1 = require("../../../test/config/test-config");
const store_1 = __importDefault(require("../../../test/fixtures/store"));
const app_1 = __importDefault(require("../../app"));
const playground_request_schema_1 = require("../../openapi/spec/playground-request-schema");
const playground_request_schema_test_1 = require("../../openapi/spec/playground-request-schema.test");
const arbitraries_test_1 = require("../../../test/arbitraries.test");
async function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = (0, store_1.default)();
    const config = (0, test_config_1.createTestConfig)({
        server: { baseUriPath: base },
        experimental: { flags: { strictSchemaValidation: true } },
    });
    const services = (0, services_1.createServices)(stores, config);
    const app = await (0, app_1.default)(config, stores, services);
    return { base, request: (0, supertest_1.default)(app) };
}
describe('toggle generator', () => {
    it('generates toggles with unique names', () => {
        fast_check_1.default.assert(fast_check_1.default.property((0, arbitraries_test_1.clientFeatures)({ minLength: 2 }), (toggles) => toggles.length ===
            [...new Set(toggles.map((feature) => feature.name))].length));
    });
});
const testParams = {
    interruptAfterTimeLimit: 4000, // Default timeout in Jest is 5000ms
    markInterruptAsFailure: false, // When set to false, timeout during initial cases will not be considered as a failure
};
describe('the playground API', () => {
    it('should return the provided input arguments as part of the response', async () => {
        await fast_check_1.default.assert(fast_check_1.default.asyncProperty((0, playground_request_schema_test_1.generate)(), async (payload) => {
            const { request, base } = await getSetup();
            const { body } = await request
                .post(`${base}/api/admin/playground`)
                .send(payload)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(body.input).toStrictEqual(payload);
            return true;
        }), testParams);
    });
    it('should return 400 if any of the required query properties are missing', async () => {
        await fast_check_1.default.assert(fast_check_1.default.asyncProperty((0, playground_request_schema_test_1.generate)(), fast_check_1.default.constantFrom(...playground_request_schema_1.playgroundRequestSchema.required), async (payload, requiredKey) => {
            const { request, base } = await getSetup();
            delete payload[requiredKey];
            const { status } = await request
                .post(`${base}/api/admin/playground`)
                .send(payload)
                .expect('Content-Type', /json/);
            return status === 400;
        }), testParams);
    });
});
//# sourceMappingURL=playground.test.js.map