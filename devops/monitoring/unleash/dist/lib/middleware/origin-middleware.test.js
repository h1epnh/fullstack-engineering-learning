"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const origin_middleware_1 = require("./origin-middleware");
const test_config_1 = require("../../test/config/test-config");
const events_1 = require("events");
const metric_events_1 = require("../metric-events");
const TEST_UNLEASH_TOKEN = 'TEST_UNLEASH_TOKEN';
const TEST_USER_AGENT = 'TEST_USER_AGENT';
describe('originMiddleware', () => {
    const req = { headers: {}, path: '' };
    const res = {};
    const next = jest.fn();
    const loggerMock = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        fatal: jest.fn(),
    };
    const getLogger = jest.fn(() => loggerMock);
    const eventBus = new events_1.EventEmitter();
    eventBus.emit = jest.fn();
    let config;
    beforeEach(() => {
        config = {
            ...(0, test_config_1.createTestConfig)({
                getLogger,
                experimental: {
                    flags: {
                        originMiddlewareRequestLogging: true,
                    },
                },
            }),
            eventBus,
        };
    });
    it('should call next', () => {
        const middleware = (0, origin_middleware_1.originMiddleware)(config);
        middleware(req, res, next);
        expect(next).toHaveBeenCalled();
    });
    it('should emit UI request origin event', () => {
        const middleware = (0, origin_middleware_1.originMiddleware)(config);
        middleware(req, res, next);
        expect(eventBus.emit).toHaveBeenCalledWith(metric_events_1.REQUEST_ORIGIN, {
            type: 'UI',
            method: req.method,
        });
    });
    it('should emit API request origin event', () => {
        const middleware = (0, origin_middleware_1.originMiddleware)(config);
        req.headers.authorization = TEST_UNLEASH_TOKEN;
        req.headers['user-agent'] = TEST_USER_AGENT;
        middleware(req, res, next);
        expect(eventBus.emit).toHaveBeenCalledWith(metric_events_1.REQUEST_ORIGIN, {
            type: 'API',
            method: req.method,
            source: 'Other',
        });
    });
    it('should log API request', () => {
        const middleware = (0, origin_middleware_1.originMiddleware)(config);
        req.headers.authorization = TEST_UNLEASH_TOKEN;
        req.headers['user-agent'] = TEST_USER_AGENT;
        middleware(req, res, next);
        expect(loggerMock.info).toHaveBeenCalledWith('API request', {
            method: req.method,
            userAgent: TEST_USER_AGENT,
            origin: undefined,
        });
    });
});
//# sourceMappingURL=origin-middleware.test.js.map