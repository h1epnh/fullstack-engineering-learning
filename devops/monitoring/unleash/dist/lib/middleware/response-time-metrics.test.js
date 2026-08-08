"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const response_time_metrics_1 = require("./response-time-metrics");
const metric_events_1 = require("../metric-events");
const fixedResponseTime = 100;
// mock response-time library
jest.mock('response-time', () => {
    return (responseTimeMetricsFn) => {
        return (req, res) => {
            return responseTimeMetricsFn(req, res, fixedResponseTime);
        };
    };
});
const isDefined = async (timeInfo, limit = 10) => {
    let counter = 0;
    while (timeInfo === undefined) {
        // Waiting for event to be triggered
        await new Promise((resolve) => setTimeout(resolve, 10));
        counter++;
        if (counter > limit) {
            throw new Error('Event was not triggered');
        }
    }
};
const flagResolver = {
    isEnabled: jest.fn(),
    getAll: jest.fn(),
    getVariant: jest.fn(),
};
// Make sure it's always cleaned up
let res;
beforeEach(() => {
    res = {
        statusCode: 200,
        locals: {}, // res will always have locals (according to express RequestHandler type)
    };
});
describe('responseTimeMetrics new behavior', () => {
    const instanceStatsService = {
        getAppCountSnapshot: jest.fn(),
    };
    const eventBus = new stream_1.EventEmitter();
    test('uses baseUrl and route path to report metrics with flag enabled, but no res.locals.route', async () => {
        let timeInfo;
        // register a listener
        eventBus.on(metric_events_1.REQUEST_TIME, (data) => {
            timeInfo = data;
        });
        const middleware = (0, response_time_metrics_1.responseTimeMetrics)(eventBus, flagResolver, instanceStatsService);
        const req = {
            baseUrl: '/api/admin',
            route: {
                path: '/features',
            },
            method: 'GET',
            path: 'should-not-be-used',
            headers: {},
        };
        // @ts-expect-error req and res doesn't have all properties
        middleware(req, res);
        await isDefined(timeInfo);
        expect(timeInfo).toMatchObject({
            path: '/api/admin/features',
        });
    });
    test('uses res.locals.route to report metrics when flag enabled', async () => {
        let timeInfo;
        // register a listener
        eventBus.on(metric_events_1.REQUEST_TIME, (data) => {
            timeInfo = data;
        });
        const middleware = (0, response_time_metrics_1.responseTimeMetrics)(eventBus, flagResolver, instanceStatsService);
        const req = {
            baseUrl: '/api/admin',
            route: {
                path: '/features',
            },
            method: 'GET',
            path: 'should-not-be-used',
        };
        const reqWithoutRoute = {
            method: 'GET',
            headers: {},
        };
        // @ts-expect-error req and res doesn't have all properties
        (0, response_time_metrics_1.storeRequestedRoute)(req, res, () => { });
        // @ts-expect-error req and res doesn't have all properties
        middleware(reqWithoutRoute, res);
        await isDefined(timeInfo);
        expect(timeInfo).toMatchObject({
            path: '/api/admin/features',
        });
    });
    test('uses res.locals.route to report metrics when flag enabled', async () => {
        let timeInfo;
        // register a listener
        eventBus.on(metric_events_1.REQUEST_TIME, (data) => {
            timeInfo = data;
        });
        const middleware = (0, response_time_metrics_1.responseTimeMetrics)(eventBus, flagResolver, instanceStatsService);
        const req = {
            baseUrl: '/api/admin',
            route: {
                path: '/features',
            },
            method: 'GET',
            path: 'should-not-be-used',
        };
        const reqWithoutRoute = {
            method: 'GET',
            headers: {},
        };
        // @ts-expect-error req and res doesn't have all properties
        (0, response_time_metrics_1.storeRequestedRoute)(req, res, () => { });
        // @ts-expect-error req and res doesn't have all properties
        middleware(reqWithoutRoute, res);
        await isDefined(timeInfo);
        expect(timeInfo).toMatchObject({
            path: '/api/admin/features',
        });
    });
    test.each([undefined, '/'])('reports (hidden) when route is undefined and path is %s', async (path) => {
        let timeInfo;
        // register a listener
        eventBus.on(metric_events_1.REQUEST_TIME, (data) => {
            timeInfo = data;
        });
        const middleware = (0, response_time_metrics_1.responseTimeMetrics)(eventBus, flagResolver, instanceStatsService);
        const req = {
            baseUrl: '/api/admin',
            method: 'GET',
            path: 'should-not-be-used',
        };
        const reqWithoutRoute = {
            method: 'GET',
            path,
            headers: {},
        };
        // @ts-expect-error req and res doesn't have all properties
        (0, response_time_metrics_1.storeRequestedRoute)(req, res, () => { });
        // @ts-expect-error req and res doesn't have all properties
        middleware(reqWithoutRoute, res);
        await isDefined(timeInfo);
        expect(timeInfo).toMatchObject({
            path: '(hidden)',
        });
    });
    test.each([
        ['/api/admin/features', '/api/admin/(hidden)'],
        ['/api/admin/features/my-feature', '/api/admin/(hidden)'],
        ['/api/frontend/client/metrics', '/api/frontend/(hidden)'],
        ['/api/client/metrics', '/api/client/(hidden)'],
        ['/edge/validate', '/edge/(hidden)'],
        ['/whatever', '(hidden)'],
        ['/healthz', '(hidden)'],
        ['/internal-backstage/prometheus', '(hidden)'],
    ])('when path is %s and route is undefined, reports %s', async (path, expected) => {
        let timeInfo;
        // register a listener
        eventBus.on(metric_events_1.REQUEST_TIME, (data) => {
            timeInfo = data;
        });
        const middleware = (0, response_time_metrics_1.responseTimeMetrics)(eventBus, flagResolver, instanceStatsService);
        const req = {
            baseUrl: '/api/admin',
            method: 'GET',
            path: 'should-not-be-used',
        };
        const reqWithoutRoute = {
            method: 'GET',
            path,
            headers: {},
        };
        // @ts-expect-error req and res doesn't have all properties
        (0, response_time_metrics_1.storeRequestedRoute)(req, res, () => { });
        // @ts-expect-error req and res doesn't have all properties
        middleware(reqWithoutRoute, res);
        await isDefined(timeInfo);
        expect(timeInfo).toMatchObject({
            path: expected,
        });
    });
});
//# sourceMappingURL=response-time-metrics.test.js.map