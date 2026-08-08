"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_config_1 = require("../../../test/config/test-config");
const instance_stats_service_1 = require("./instance-stats-service");
const store_1 = __importDefault(require("../../../test/fixtures/store"));
const version_service_1 = __importDefault(require("../../services/version-service"));
const getActiveUsers_1 = require("./getActiveUsers");
const getProductionChanges_1 = require("./getProductionChanges");
const metrics_1 = require("../../metrics");
const prom_client_1 = require("prom-client");
const getLicensedUsers_1 = require("./getLicensedUsers");
let instanceStatsService;
let versionService;
let clientInstanceStore;
let stores;
let flagResolver;
let updateMetrics;
beforeEach(() => {
    jest.clearAllMocks();
    prom_client_1.register.clear();
    const config = (0, test_config_1.createTestConfig)();
    flagResolver = config.flagResolver;
    stores = (0, store_1.default)();
    versionService = new version_service_1.default(stores, config);
    clientInstanceStore = stores.clientInstanceStore;
    instanceStatsService = new instance_stats_service_1.InstanceStatsService(stores, config, versionService, (0, getActiveUsers_1.createFakeGetActiveUsers)(), (0, getProductionChanges_1.createFakeGetProductionChanges)(), (0, getLicensedUsers_1.createFakeGetLicensedUsers)());
    const { collectAggDbMetrics } = (0, metrics_1.registerPrometheusMetrics)(config, stores, undefined, config.eventBus, instanceStatsService);
    updateMetrics = collectAggDbMetrics;
    jest.spyOn(clientInstanceStore, 'getDistinctApplicationsCount');
    jest.spyOn(instanceStatsService, 'getStats');
    expect(instanceStatsService.getStats).toHaveBeenCalledTimes(0);
});
test('get snapshot should not call getStats', async () => {
    await updateMetrics();
    expect(clientInstanceStore.getDistinctApplicationsCount).toHaveBeenCalledTimes(3);
    expect(instanceStatsService.getStats).toHaveBeenCalledTimes(0);
    for (let i = 0; i < 3; i++) {
        const { clientApps } = await instanceStatsService.getStats();
        expect(clientApps).toStrictEqual([
            { count: 0, range: '7d' },
            { count: 0, range: '30d' },
            { count: 0, range: 'allTime' },
        ]);
    }
    // after querying the stats snapshot no call to getStats should be issued
    expect(clientInstanceStore.getDistinctApplicationsCount).toHaveBeenCalledTimes(3);
});
test('before the snapshot is refreshed we can still get the appCount', async () => {
    expect(instanceStatsService.getAppCountSnapshot('7d')).toBeUndefined();
});
describe.each([true, false])('When feature enabled is %s', (featureEnabled) => {
    beforeEach(() => {
        jest.spyOn(flagResolver, 'getVariant').mockReturnValue({
            name: 'memorizeStats',
            enabled: featureEnabled,
            feature_enabled: featureEnabled,
        });
    });
    test(`should${featureEnabled ? ' ' : ' not '}memoize query results`, async () => {
        const segmentStore = stores.segmentStore;
        jest.spyOn(segmentStore, 'count').mockReturnValue(Promise.resolve(5));
        expect(segmentStore.count).toHaveBeenCalledTimes(0);
        expect(await instanceStatsService.segmentCount()).toBe(5);
        expect(segmentStore.count).toHaveBeenCalledTimes(1);
        expect(await instanceStatsService.segmentCount()).toBe(5);
        expect(segmentStore.count).toHaveBeenCalledTimes(featureEnabled ? 1 : 2);
    });
    test(`should${featureEnabled ? ' ' : ' not '}memoize async query results`, async () => {
        const trafficDataUsageStore = stores.trafficDataUsageStore;
        jest.spyOn(trafficDataUsageStore, 'getTrafficDataUsageForPeriod').mockReturnValue(Promise.resolve([
            {
                day: new Date(),
                trafficGroup: 'default',
                statusCodeSeries: 200,
                count: 5,
            },
            {
                day: new Date(),
                trafficGroup: 'default',
                statusCodeSeries: 400,
                count: 2,
            },
        ]));
        expect(trafficDataUsageStore.getTrafficDataUsageForPeriod).toHaveBeenCalledTimes(0);
        expect(await instanceStatsService.getCurrentTrafficData()).toBe(7);
        expect(trafficDataUsageStore.getTrafficDataUsageForPeriod).toHaveBeenCalledTimes(1);
        expect(await instanceStatsService.getCurrentTrafficData()).toBe(7);
        expect(trafficDataUsageStore.getTrafficDataUsageForPeriod).toHaveBeenCalledTimes(featureEnabled ? 1 : 2);
    });
    test(`getStats should${featureEnabled ? ' ' : ' not '}be memorized`, async () => {
        const featureStrategiesReadModel = stores.featureStrategiesReadModel;
        jest.spyOn(featureStrategiesReadModel, 'getMaxFeatureEnvironmentStrategies').mockReturnValue(Promise.resolve({
            feature: 'x',
            environment: 'default',
            count: 3,
        }));
        expect(featureStrategiesReadModel.getMaxFeatureEnvironmentStrategies).toHaveBeenCalledTimes(0);
        expect((await instanceStatsService.getStats())
            .maxEnvironmentStrategies).toBe(3);
        expect(featureStrategiesReadModel.getMaxFeatureEnvironmentStrategies).toHaveBeenCalledTimes(1);
        expect((await instanceStatsService.getStats())
            .maxEnvironmentStrategies).toBe(3);
        expect(featureStrategiesReadModel.getMaxFeatureEnvironmentStrategies).toHaveBeenCalledTimes(featureEnabled ? 1 : 2);
    });
});
//# sourceMappingURL=instance-stats-service.test.js.map