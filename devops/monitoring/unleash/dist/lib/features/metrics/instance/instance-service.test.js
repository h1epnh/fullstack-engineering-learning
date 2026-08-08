"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const instance_service_1 = __importDefault(require("./instance-service"));
const fake_event_store_1 = __importDefault(require("../../../../test/fixtures/fake-event-store"));
const test_config_1 = require("../../../../test/config/test-config");
const fakePrivateProjectChecker_1 = require("../../private-project/fakePrivateProjectChecker");
const fake_client_metrics_store_v2_1 = __importDefault(require("../client-metrics/fake-client-metrics-store-v2"));
const fake_strategies_store_1 = __importDefault(require("../../../../test/fixtures/fake-strategies-store"));
const fake_feature_toggle_store_1 = __importDefault(require("../../feature-toggle/fakes/fake-feature-toggle-store"));
let config;
beforeAll(() => {
    config = (0, test_config_1.createTestConfig)({});
});
test('Multiple registrations of same appname and instanceid within same time period should only cause one registration', async () => {
    const appStoreSpy = jest.fn();
    const bulkSpy = jest.fn();
    const clientApplicationsStore = {
        bulkUpsert: appStoreSpy,
    };
    const clientInstanceStore = {
        bulkUpsert: bulkSpy,
    };
    const clientMetrics = new instance_service_1.default({
        clientMetricsStoreV2: new fake_client_metrics_store_v2_1.default(),
        strategyStore: new fake_strategies_store_1.default(),
        featureToggleStore: new fake_feature_toggle_store_1.default(),
        clientApplicationsStore,
        clientInstanceStore,
        eventStore: new fake_event_store_1.default(),
    }, config, new fakePrivateProjectChecker_1.FakePrivateProjectChecker());
    const client1 = {
        appName: 'test_app',
        instanceId: 'ava',
        strategies: [{ name: 'defaullt' }],
        started: new Date(),
        interval: 10,
    };
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.bulkAdd(); // in prod called by a SchedulerService
    expect(appStoreSpy).toHaveBeenCalledTimes(1);
    expect(bulkSpy).toHaveBeenCalledTimes(1);
    const registrations = appStoreSpy.mock.calls[0][0];
    expect(registrations.length).toBe(1);
    expect(registrations[0].appName).toBe(client1.appName);
    expect(registrations[0].instanceId).toBe(client1.instanceId);
    expect(registrations[0].started).toBe(client1.started);
    expect(registrations[0].interval).toBe(client1.interval);
    jest.useRealTimers();
});
test('Multiple unique clients causes multiple registrations', async () => {
    const appStoreSpy = jest.fn();
    const bulkSpy = jest.fn();
    const clientApplicationsStore = {
        bulkUpsert: appStoreSpy,
    };
    const clientInstanceStore = {
        bulkUpsert: bulkSpy,
    };
    const clientMetrics = new instance_service_1.default({
        clientMetricsStoreV2: new fake_client_metrics_store_v2_1.default(),
        strategyStore: new fake_strategies_store_1.default(),
        featureToggleStore: new fake_feature_toggle_store_1.default(),
        clientApplicationsStore,
        clientInstanceStore,
        eventStore: new fake_event_store_1.default(),
    }, config, new fakePrivateProjectChecker_1.FakePrivateProjectChecker());
    const client1 = {
        appName: 'test_app',
        instanceId: 'client1',
        strategies: [{ name: 'defaullt' }],
        started: new Date(),
        interval: 10,
    };
    const client2 = {
        appName: 'test_app_2',
        instanceId: 'client2',
        strategies: [{ name: 'defaullt' }],
        started: new Date(),
        interval: 10,
    };
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client2, '127.0.0.1');
    await clientMetrics.registerClient(client2, '127.0.0.1');
    await clientMetrics.registerClient(client2, '127.0.0.1');
    await clientMetrics.bulkAdd(); // in prod called by a SchedulerService
    const registrations = appStoreSpy.mock.calls[0][0];
    expect(registrations.length).toBe(2);
});
test('Same client registered outside of dedup interval will be registered twice', async () => {
    const appStoreSpy = jest.fn();
    const bulkSpy = jest.fn();
    const clientApplicationsStore = {
        bulkUpsert: appStoreSpy,
    };
    const clientInstanceStore = {
        bulkUpsert: bulkSpy,
    };
    const clientMetrics = new instance_service_1.default({
        clientMetricsStoreV2: new fake_client_metrics_store_v2_1.default(),
        strategyStore: new fake_strategies_store_1.default(),
        featureToggleStore: new fake_feature_toggle_store_1.default(),
        clientApplicationsStore,
        clientInstanceStore,
        eventStore: new fake_event_store_1.default(),
    }, config, new fakePrivateProjectChecker_1.FakePrivateProjectChecker());
    const client1 = {
        appName: 'test_app',
        instanceId: 'client1',
        strategies: [{ name: 'defaullt' }],
        started: new Date(),
        interval: 10,
    };
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.bulkAdd(); // in prod called by a SchedulerService
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.bulkAdd(); // in prod called by a SchedulerService
    expect(appStoreSpy).toHaveBeenCalledTimes(2);
    expect(bulkSpy).toHaveBeenCalledTimes(2);
    const firstRegistrations = appStoreSpy.mock.calls[0][0][0];
    const secondRegistrations = appStoreSpy.mock.calls[1][0][0];
    expect(firstRegistrations.appName).toBe(secondRegistrations.appName);
    expect(firstRegistrations.instanceId).toBe(secondRegistrations.instanceId);
});
test('No registrations during a time period will not call stores', async () => {
    const appStoreSpy = jest.fn();
    const bulkSpy = jest.fn();
    const clientApplicationsStore = {
        bulkUpsert: appStoreSpy,
    };
    const clientInstanceStore = {
        bulkUpsert: bulkSpy,
    };
    const clientMetrics = new instance_service_1.default({
        clientMetricsStoreV2: new fake_client_metrics_store_v2_1.default(),
        strategyStore: new fake_strategies_store_1.default(),
        featureToggleStore: new fake_feature_toggle_store_1.default(),
        clientApplicationsStore,
        clientInstanceStore,
        eventStore: new fake_event_store_1.default(),
    }, config, new fakePrivateProjectChecker_1.FakePrivateProjectChecker());
    await clientMetrics.bulkAdd(); // in prod called by a SchedulerService
    expect(appStoreSpy).toHaveBeenCalledTimes(0);
    expect(bulkSpy).toHaveBeenCalledTimes(0);
});
test('filter out private projects from overview', async () => {
    const clientApplicationsStore = {
        async getApplicationOverview(appName) {
            return {
                environments: [
                    {
                        name: 'development',
                        instanceCount: 1,
                        sdks: ['unleash-client-node:3.5.1'],
                        lastSeen: new Date(),
                        issues: {
                            missingFeatures: [],
                            outdatedSdks: [],
                        },
                    },
                ],
                projects: ['privateProject', 'publicProject'],
                issues: {
                    missingStrategies: [],
                },
                featureCount: 0,
            };
        },
    };
    const privateProjectsChecker = {
        async filterUserAccessibleProjects(userId, projects) {
            return projects.filter((project) => !project.includes('private'));
        },
    };
    const clientInstanceService = new instance_service_1.default({ clientApplicationsStore }, config, privateProjectsChecker);
    const overview = await clientInstanceService.getApplicationOverview('appName', 123);
    expect(overview).toMatchObject({
        environments: [
            {
                name: 'development',
                instanceCount: 1,
                sdks: ['unleash-client-node:3.5.1'],
                issues: {
                    missingFeatures: [],
                    outdatedSdks: ['unleash-client-node:3.5.1'],
                },
            },
        ],
        projects: ['publicProject'],
        issues: {
            missingStrategies: [],
        },
        featureCount: 0,
    });
});
//# sourceMappingURL=instance-service.test.js.map