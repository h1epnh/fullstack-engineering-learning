"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const test_config_1 = require("../../../../test/config/test-config");
const store_1 = __importDefault(require("../../../../test/fixtures/store"));
const no_logger_1 = __importDefault(require("../../../../test/fixtures/no-logger"));
const app_1 = __importDefault(require("../../../app"));
const services_1 = require("../../../services");
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
test('should register client', () => {
    expect.assertions(0);
    return request
        .post('/api/client/register')
        .send({
        appName: 'demo',
        instanceId: 'test',
        strategies: ['default'],
        sdkVersion: 'unleash-client-test:1.2',
        started: Date.now(),
        interval: 10,
    })
        .expect(202);
});
test('should register client without sdkVersion', () => {
    expect.assertions(0);
    return request
        .post('/api/client/register')
        .send({
        appName: 'demo',
        instanceId: 'test',
        strategies: ['default'],
        started: Date.now(),
        interval: 10,
    })
        .expect(202);
});
test('should require appName field', () => {
    expect.assertions(0);
    return request
        .post('/api/client/register')
        .set('Content-Type', 'application/json')
        .expect(400);
});
test('should require strategies field', () => {
    expect.assertions(0);
    return request
        .post('/api/client/register')
        .send({
        appName: 'demo',
        instanceId: 'test',
        // strategies: ['default'],
        started: Date.now(),
        interval: 10,
    })
        .expect(400);
});
test('should allow an no instanceId field', () => {
    expect.assertions(0);
    return request
        .post('/api/client/register')
        .send({
        appName: 'demo',
        strategies: ['default'],
        started: Date.now(),
        interval: 10,
    })
        .expect(202);
});
test('should allow an empty instanceId field', () => {
    expect.assertions(0);
    return request
        .post('/api/client/register')
        .send({
        appName: 'demo',
        instanceId: '',
        strategies: ['default'],
        started: Date.now(),
        interval: 10,
    })
        .expect(202);
});
test('Includes an X-Unleash-Version header in the response', () => {
    return request
        .post('/api/client/register')
        .send({
        appName: 'demo',
        instanceId: '',
        strategies: ['default'],
        started: Date.now(),
        interval: 10,
    })
        .expect(202)
        .expect((res) => {
        expect(res.headers['x-unleash-version']).toBeTruthy();
    });
});
//# sourceMappingURL=register.test.js.map