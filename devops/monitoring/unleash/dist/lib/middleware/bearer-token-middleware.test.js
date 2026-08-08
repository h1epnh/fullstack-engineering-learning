"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bearer_token_middleware_1 = require("./bearer-token-middleware");
const test_config_1 = require("../../test/config/test-config");
const no_logger_1 = __importDefault(require("../../test/fixtures/no-logger"));
const exampleSignalToken = 'signal_tokensecret';
describe('bearerTokenMiddleware', () => {
    const req = { headers: {}, path: '' };
    const res = {};
    const next = jest.fn();
    let config;
    beforeEach(() => {
        config = (0, test_config_1.createTestConfig)({
            getLogger: no_logger_1.default,
        });
    });
    it('should call next', () => {
        const middleware = (0, bearer_token_middleware_1.bearerTokenMiddleware)(config);
        middleware(req, res, next);
        expect(next).toHaveBeenCalled();
    });
    it('should leave Unleash tokens intact', () => {
        const middleware = (0, bearer_token_middleware_1.bearerTokenMiddleware)(config);
        req.headers = { authorization: exampleSignalToken };
        middleware(req, res, next);
        expect(req.headers.authorization).toBe(exampleSignalToken);
    });
    it('should convert Bearer token to Unleash token', () => {
        const middleware = (0, bearer_token_middleware_1.bearerTokenMiddleware)(config);
        const bearerToken = `Bearer ${exampleSignalToken}`;
        req.headers = { authorization: bearerToken };
        middleware(req, res, next);
        expect(req.headers.authorization).toBe(exampleSignalToken);
    });
    it('should be case insensitive in the scheme', () => {
        const middleware = (0, bearer_token_middleware_1.bearerTokenMiddleware)(config);
        const bearerToken = `bEaReR ${exampleSignalToken}`;
        req.headers = { authorization: bearerToken };
        middleware(req, res, next);
        expect(req.headers.authorization).toBe(exampleSignalToken);
    });
    it('should always run for signal endpoint, without base path', () => {
        const configWithBearerTokenMiddlewareFlagDisabled = (0, test_config_1.createTestConfig)({
            getLogger: no_logger_1.default,
        });
        const middleware = (0, bearer_token_middleware_1.bearerTokenMiddleware)(configWithBearerTokenMiddlewareFlagDisabled);
        req.path = '/api/signal-endpoint/';
        const bearerToken = `Bearer ${exampleSignalToken}`;
        req.headers = { authorization: bearerToken };
        middleware(req, res, next);
        expect(req.headers.authorization).toBe(exampleSignalToken);
    });
    it('should always run for signal endpoint, regardless of the flag, with base path', () => {
        const configWithBearerTokenMiddlewareFlagDisabled = (0, test_config_1.createTestConfig)({
            getLogger: no_logger_1.default,
            server: {
                baseUriPath: '/some-test-instance',
            },
        });
        const middleware = (0, bearer_token_middleware_1.bearerTokenMiddleware)(configWithBearerTokenMiddlewareFlagDisabled);
        req.path = '/some-test-instance/api/signal-endpoint/';
        const bearerToken = `Bearer ${exampleSignalToken}`;
        req.headers = { authorization: bearerToken };
        middleware(req, res, next);
        expect(req.headers.authorization).toBe(exampleSignalToken);
    });
});
//# sourceMappingURL=bearer-token-middleware.test.js.map