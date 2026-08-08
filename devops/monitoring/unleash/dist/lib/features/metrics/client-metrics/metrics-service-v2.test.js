"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const metrics_service_v2_1 = __importDefault(require("./metrics-service-v2"));
const no_logger_1 = __importDefault(require("../../../../test/fixtures/no-logger"));
const store_1 = __importDefault(require("../../../../test/fixtures/store"));
const events_1 = __importDefault(require("events"));
const last_seen_service_1 = require("../last-seen/last-seen-service");
const date_fns_1 = require("date-fns");
function initClientMetrics(flagEnabled = true) {
    const stores = (0, store_1.default)();
    const eventBus = new events_1.default();
    eventBus.emit = jest.fn();
    const config = {
        eventBus,
        getLogger: no_logger_1.default,
        flagResolver: {
            isEnabled: () => {
                return flagEnabled;
            },
        },
    };
    const lastSeenService = new last_seen_service_1.LastSeenService({
        lastSeenStore: stores.lastSeenStore,
    }, config);
    lastSeenService.updateLastSeen = jest.fn();
    const service = new metrics_service_v2_1.default(stores, config, lastSeenService);
    return { clientMetricsService: service, eventBus, lastSeenService };
}
test('process metrics properly', async () => {
    const { clientMetricsService, eventBus, lastSeenService } = initClientMetrics();
    await clientMetricsService.registerClientMetrics({
        appName: 'test',
        bucket: {
            start: '1982-07-25T12:00:00.000Z',
            stop: '2023-07-25T12:00:00.000Z',
            toggles: {
                myCoolToggle: {
                    yes: 25,
                    no: 42,
                    variants: {
                        blue: 6,
                        green: 15,
                        red: 46,
                    },
                },
                myOtherToggle: {
                    yes: 0,
                    no: 100,
                },
            },
        },
        environment: 'test',
    }, '127.0.0.1');
    expect(eventBus.emit).toHaveBeenCalledTimes(1);
    expect(lastSeenService.updateLastSeen).toHaveBeenCalledTimes(1);
});
test('process metrics properly even when some names are not url friendly, filtering out invalid names when flag is on', async () => {
    const { clientMetricsService, eventBus, lastSeenService } = initClientMetrics();
    await clientMetricsService.registerClientMetrics({
        appName: 'test',
        bucket: {
            start: '1982-07-25T12:00:00.000Z',
            stop: '2023-07-25T12:00:00.000Z',
            toggles: {
                'not url friendly ☹': {
                    yes: 0,
                    no: 100,
                },
            },
        },
        environment: 'test',
    }, '127.0.0.1');
    // only toggle with a bad name gets filtered out
    expect(eventBus.emit).not.toHaveBeenCalled();
    expect(lastSeenService.updateLastSeen).not.toHaveBeenCalled();
});
test('process metrics properly even when some names are not url friendly, with default behavior when flag is off', async () => {
    const { clientMetricsService, eventBus, lastSeenService } = initClientMetrics(false);
    await clientMetricsService.registerClientMetrics({
        appName: 'test',
        bucket: {
            start: '1982-07-25T12:00:00.000Z',
            stop: '2023-07-25T12:00:00.000Z',
            toggles: {
                'not url friendly ☹': {
                    yes: 0,
                    no: 100,
                },
            },
        },
        environment: 'test',
    }, '127.0.0.1');
    expect(eventBus.emit).toHaveBeenCalledTimes(1);
    expect(lastSeenService.updateLastSeen).toHaveBeenCalledTimes(1);
});
test('get daily client metrics for a toggle', async () => {
    const yesterday = (0, date_fns_1.subDays)(new Date(), 1);
    const twoDaysAgo = (0, date_fns_1.subDays)(new Date(), 2);
    const threeDaysAgo = (0, date_fns_1.subDays)(new Date(), 3);
    const baseData = {
        featureName: 'feature',
        appName: 'test',
        environment: 'development',
        yes: 0,
        no: 0,
    };
    const clientMetricsStoreV2 = {
        getMetricsForFeatureToggleV2(featureName, hoursBack) {
            return Promise.resolve([
                {
                    ...baseData,
                    timestamp: (0, date_fns_1.endOfDay)(yesterday),
                    yes: 2,
                    no: 1,
                    variants: { a: 1, b: 1 },
                },
            ]);
        },
    };
    const config = {
        flagResolver: {
            isEnabled() {
                return true;
            },
        },
        getLogger() { },
    };
    const lastSeenService = {};
    const service = new metrics_service_v2_1.default({ clientMetricsStoreV2 }, config, lastSeenService);
    const metrics = await service.getClientMetricsForToggle('feature', 3 * 24);
    expect(metrics).toMatchObject([
        { ...baseData, timestamp: (0, date_fns_1.endOfDay)(threeDaysAgo) },
        { ...baseData, timestamp: (0, date_fns_1.endOfDay)(twoDaysAgo) },
        {
            ...baseData,
            timestamp: (0, date_fns_1.endOfDay)(yesterday),
            yes: 2,
            no: 1,
            variants: { a: 1, b: 1 },
        },
    ]);
});
test('get hourly client metrics for a toggle', async () => {
    const hourAgo = (0, date_fns_1.startOfHour)((0, date_fns_1.subHours)(new Date(), 1));
    const thisHour = (0, date_fns_1.startOfHour)(new Date());
    const baseData = {
        featureName: 'feature',
        appName: 'test',
        environment: 'development',
        yes: 0,
        no: 0,
    };
    const clientMetricsStoreV2 = {
        getMetricsForFeatureToggleV2(featureName, hoursBack) {
            return Promise.resolve([
                {
                    ...baseData,
                    timestamp: thisHour,
                    yes: 2,
                    no: 1,
                    variants: { a: 1, b: 1 },
                },
            ]);
        },
    };
    const config = {
        flagResolver: {
            isEnabled() {
                return true;
            },
        },
        getLogger() { },
    };
    const lastSeenService = {};
    const service = new metrics_service_v2_1.default({ clientMetricsStoreV2 }, config, lastSeenService);
    const metrics = await service.getClientMetricsForToggle('feature', 2);
    expect(metrics).toMatchObject([
        { ...baseData, timestamp: hourAgo },
        {
            ...baseData,
            timestamp: thisHour,
            yes: 2,
            no: 1,
            variants: { a: 1, b: 1 },
        },
    ]);
});
const setupMetricsService = ({ enabledCount, variantCount, enabledDailyCount, variantDailyCount, limit, }) => {
    let aggregationCalled = false;
    let recordedWarning = '';
    const clientMetricsStoreV2 = {
        aggregateDailyMetrics() {
            aggregationCalled = true;
            return Promise.resolve();
        },
        countPreviousDayHourlyMetricsBuckets() {
            return { enabledCount, variantCount };
        },
        countPreviousDayMetricsBuckets() {
            return {
                enabledCount: enabledDailyCount,
                variantCount: variantDailyCount,
            };
        },
    };
    const config = {
        flagResolver: {
            isEnabled() {
                return true;
            },
            getVariant() {
                return { payload: { value: limit } };
            },
        },
        getLogger() {
            return {
                warn(message) {
                    recordedWarning = message;
                },
            };
        },
    };
    const lastSeenService = {};
    const service = new metrics_service_v2_1.default({ clientMetricsStoreV2 }, config, lastSeenService);
    return {
        service,
        aggregationCalled: () => aggregationCalled,
        recordedWarning: () => recordedWarning,
    };
};
test('do not aggregate previous day metrics when metrics already calculated', async () => {
    const { service, recordedWarning, aggregationCalled } = setupMetricsService({
        enabledCount: 2,
        variantCount: 4,
        enabledDailyCount: 2,
        variantDailyCount: 4,
        limit: 6,
    });
    await service.aggregateDailyMetrics();
    expect(recordedWarning()).toBe('');
    expect(aggregationCalled()).toBe(false);
});
test('do not aggregate previous day metrics when metrics count is below limit', async () => {
    const { service, recordedWarning, aggregationCalled } = setupMetricsService({
        enabledCount: 2,
        variantCount: 4,
        enabledDailyCount: 0,
        variantDailyCount: 0,
        limit: 5,
    });
    await service.aggregateDailyMetrics();
    expect(recordedWarning()).toBe('Skipping previous day metrics aggregation. Too many results. Expected max value: 5, Actual value: 6');
    expect(aggregationCalled()).toBe(false);
});
test('aggregate previous day metrics', async () => {
    const { service, recordedWarning, aggregationCalled } = setupMetricsService({
        enabledCount: 2,
        variantCount: 4,
        enabledDailyCount: 0,
        variantDailyCount: 0,
        limit: 6,
    });
    await service.aggregateDailyMetrics();
    expect(recordedWarning()).toBe('');
    expect(aggregationCalled()).toBe(true);
});
//# sourceMappingURL=metrics-service-v2.test.js.map