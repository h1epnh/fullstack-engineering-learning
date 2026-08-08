"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nock_1 = __importDefault(require("nock"));
const no_logger_1 = __importDefault(require("../../test/fixtures/no-logger"));
const slack_1 = __importDefault(require("./slack"));
beforeEach(() => {
    nock_1.default.disableNetConnect();
});
const url = 'https://test.some.com';
const ARGS = {
    getLogger: no_logger_1.default,
    unleashUrl: url,
    integrationEventsService: {},
    flagResolver: {},
    eventBus: {},
};
test('Does not retry if request succeeds', async () => {
    const url = 'https://test.some.com';
    const addon = new slack_1.default(ARGS);
    (0, nock_1.default)(url).get('/').reply(201);
    const res = await addon.fetchRetry(url);
    expect(res.ok).toBe(true);
});
test('Retries once, and succeeds', async () => {
    const addon = new slack_1.default(ARGS);
    (0, nock_1.default)(url).get('/').replyWithError('testing retry');
    (0, nock_1.default)(url).get('/').reply(200);
    const res = await addon.fetchRetry(url);
    expect(res.ok).toBe(true);
    expect(nock_1.default.isDone()).toBe(true);
});
test('Does not throw if response is error', async () => {
    const addon = new slack_1.default(ARGS);
    (0, nock_1.default)(url).get('/').twice().replyWithError('testing retry');
    const res = await addon.fetchRetry(url);
    expect(res.ok).toBe(false);
});
test('Supports custom number of retries', async () => {
    const addon = new slack_1.default(ARGS);
    let retries = 0;
    (0, nock_1.default)(url).get('/').twice().replyWithError('testing retry');
    (0, nock_1.default)(url).get('/').reply(201);
    const res = await addon.fetchRetry(url, {
        onRetry: () => {
            retries = retries + 1;
        },
    }, 2);
    expect(retries).toBe(2);
    expect(res.ok).toBe(true);
    expect(nock_1.default.isDone()).toBe(true);
});
afterEach(() => {
    nock_1.default.enableNetConnect();
});
//# sourceMappingURL=addon.test.js.map