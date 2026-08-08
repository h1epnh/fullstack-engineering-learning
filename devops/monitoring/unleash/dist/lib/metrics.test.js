"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prom_client_1 = require("prom-client");
const events_1 = __importDefault(require("events"));
const test_config_1 = require("../test/config/test-config");
const metric_events_1 = require("./metric-events");
const events_2 = require("./types/events");
const metrics_1 = require("./metrics");
const store_1 = __importDefault(require("../test/fixtures/store"));
const instance_stats_service_1 = require("./features/instance-stats/instance-stats-service");
const version_service_1 = __importDefault(require("./services/version-service"));
const getActiveUsers_1 = require("./features/instance-stats/getActiveUsers");
const getProductionChanges_1 = require("./features/instance-stats/getProductionChanges");
const fake_environment_store_1 = __importDefault(require("./features/project-environments/fake-environment-store"));
const services_1 = require("./services");
const no_logger_1 = __importDefault(require("../test/fixtures/no-logger"));
const no_logger_2 = __importDefault(require("../test/fixtures/no-logger"));
const database_init_1 = __importDefault(require("../test/e2e/helpers/database-init"));
const feature_lifecycle_store_1 = require("./features/feature-lifecycle/feature-lifecycle-store");
const feature_lifecycle_read_model_1 = require("./features/feature-lifecycle/feature-lifecycle-read-model");
const getLicensedUsers_1 = require("./features/instance-stats/getLicensedUsers");
const monitor = (0, metrics_1.createMetricsMonitor)();
const eventBus = new events_1.default();
const prometheusRegister = prom_client_1.register;
let eventStore;
let environmentStore;
let statsService;
let stores;
let schedulerService;
let featureLifeCycleStore;
let featureLifeCycleReadModel;
let db;
let refreshDbMetrics;
beforeAll(async () => {
    const config = (0, test_config_1.createTestConfig)({
        server: {
            serverMetrics: true,
        },
    });
    stores = (0, store_1.default)();
    eventStore = stores.eventStore;
    environmentStore = new fake_environment_store_1.default();
    stores.environmentStore = environmentStore;
    const versionService = new version_service_1.default(stores, config);
    db = await (0, database_init_1.default)('metrics_test', no_logger_2.default);
    featureLifeCycleReadModel = new feature_lifecycle_read_model_1.FeatureLifecycleReadModel(db.rawDatabase, config.flagResolver);
    stores.featureLifecycleReadModel = featureLifeCycleReadModel;
    featureLifeCycleStore = new feature_lifecycle_store_1.FeatureLifecycleStore(db.rawDatabase);
    stores.featureLifecycleStore = featureLifeCycleStore;
    statsService = new instance_stats_service_1.InstanceStatsService(stores, config, versionService, (0, getActiveUsers_1.createFakeGetActiveUsers)(), (0, getProductionChanges_1.createFakeGetProductionChanges)(), (0, getLicensedUsers_1.createFakeGetLicensedUsers)());
    schedulerService = new services_1.SchedulerService(no_logger_1.default, {
        isMaintenanceMode: () => Promise.resolve(false),
    }, eventBus);
    const metricsDbConf = {
        client: {
            pool: {
                min: 0,
                max: 4,
                numUsed: () => 2,
                numFree: () => 2,
                numPendingAcquires: () => 0,
                numPendingCreates: () => 1,
            },
        },
    };
    const { collectAggDbMetrics, collectStaticCounters } = (0, metrics_1.registerPrometheusMetrics)(config, stores, '4.0.0', eventBus, statsService);
    refreshDbMetrics = collectAggDbMetrics;
    await collectStaticCounters();
});
afterAll(async () => {
    schedulerService.stop();
});
test('should collect metrics for requests', async () => {
    eventBus.emit(metric_events_1.REQUEST_TIME, {
        path: 'somePath',
        method: 'GET',
        statusCode: 200,
        time: 1337,
    });
    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(/http_request_duration_milliseconds\{quantile="0\.99",path="somePath",method="GET",status="200",appName="undefined"\}.*1337/);
});
test('should collect metrics for updated toggles', async () => {
    stores.eventStore.emit(events_2.FEATURE_UPDATED, {
        featureName: 'TestToggle',
        project: 'default',
        data: { name: 'TestToggle' },
    });
    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(/feature_toggle_update_total\{toggle="TestToggle",project="default",environment="default",environmentType="production",action="updated"\} 1/);
});
test('should set environmentType when toggle is flipped', async () => {
    await environmentStore.create({
        name: 'testEnvironment',
        enabled: true,
        type: 'testType',
        sortOrder: 1,
    });
    stores.eventStore.emit(events_2.FEATURE_ENVIRONMENT_ENABLED, {
        featureName: 'TestToggle',
        project: 'default',
        environment: 'testEnvironment',
        data: { name: 'TestToggle' },
    });
    // Wait for event to be processed, not nice, but it works.
    await new Promise((done) => {
        setTimeout(done, 1);
    });
    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(/feature_toggle_update_total\{toggle="TestToggle",project="default",environment="testEnvironment",environmentType="testType",action="updated"\} 1/);
});
test('should collect metrics for client metric reports', async () => {
    eventBus.emit(events_2.CLIENT_METRICS, [
        {
            featureName: 'TestToggle',
            yes: 10,
            no: 5,
        },
    ]);
    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(/feature_toggle_usage_total\{toggle="TestToggle",active="true",appName="undefined"\} 10\nfeature_toggle_usage_total\{toggle="TestToggle",active="false",appName="undefined"\} 5/);
});
test('should collect metrics for db query timings', async () => {
    eventBus.emit(metric_events_1.DB_TIME, {
        store: 'foo',
        action: 'bar',
        time: 0.1337,
    });
    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(/db_query_duration_seconds\{quantile="0\.99",store="foo",action="bar"\} 0.1337/);
});
test('should collect metrics for function timings', async () => {
    eventBus.emit(metric_events_1.FUNCTION_TIME, {
        functionName: 'getToggles',
        className: 'ToggleService',
        time: 0.1337,
    });
    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(/function_duration_seconds\{quantile="0\.99",functionName="getToggles",className="ToggleService"\} 0.1337/);
});
test('should collect metrics for feature flag size', async () => {
    await refreshDbMetrics();
    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(/feature_toggles_total\{version="(.*)"\} 0/);
});
test('should collect metrics for archived feature flag size', async () => {
    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(/feature_toggles_archived_total 0/);
});
test('should collect metrics for total client apps', async () => {
    await refreshDbMetrics();
    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(/client_apps_total\{range="(.*)"\} 0/);
});
test('Should collect metrics for database', async () => {
    (0, metrics_1.registerPrometheusPostgresMetrics)(db.rawDatabase, eventBus, '15.0.0');
    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(/db_pool_max/);
    expect(metrics).toMatch(/db_pool_min/);
    expect(metrics).toMatch(/db_pool_used/);
    expect(metrics).toMatch(/db_pool_free/);
    expect(metrics).toMatch(/db_pool_pending_creates/);
    expect(metrics).toMatch(/db_pool_pending_acquires/);
});
test('Should collect metrics for client sdk versions', async () => {
    eventStore.emit(events_2.CLIENT_REGISTER, {
        sdkName: 'unleash-client-node',
        sdkVersion: '3.2.5',
    });
    eventStore.emit(events_2.CLIENT_REGISTER, {
        sdkName: 'unleash-client-node',
        sdkVersion: '3.2.5',
    });
    eventStore.emit(events_2.CLIENT_REGISTER, {
        sdkName: 'unleash-client-node',
        sdkVersion: '3.2.5',
    });
    eventStore.emit(events_2.CLIENT_REGISTER, {
        sdkName: 'unleash-client-java',
        sdkVersion: '5.0.0',
    });
    eventStore.emit(events_2.CLIENT_REGISTER, {
        sdkName: 'unleash-client-java',
        sdkVersion: '5.0.0',
    });
    eventStore.emit(events_2.CLIENT_REGISTER, {
        sdkName: 'unleash-client-java',
        sdkVersion: '5.0.0',
    });
    const metrics = await prometheusRegister.getSingleMetricAsString('client_sdk_versions');
    expect(metrics).toMatch(/client_sdk_versions\{sdk_name="unleash-client-node",sdk_version="3\.2\.5"\,platform_name=\"not-set\",platform_version=\"not-set\",yggdrasil_version=\"not-set\",spec_version=\"not-set\"} 3/);
    expect(metrics).toMatch(/client_sdk_versions\{sdk_name="unleash-client-java",sdk_version="5\.0\.0"\,platform_name=\"not-set\",platform_version=\"not-set\",yggdrasil_version=\"not-set\",spec_version=\"not-set\"} 3/);
    eventStore.emit(events_2.CLIENT_REGISTER, {
        sdkName: 'unleash-client-node',
        sdkVersion: '3.2.5',
    });
    const newmetrics = await prometheusRegister.getSingleMetricAsString('client_sdk_versions');
    expect(newmetrics).toMatch(/client_sdk_versions\{sdk_name="unleash-client-node",sdk_version="3\.2\.5"\,platform_name=\"not-set\",platform_version=\"not-set\",yggdrasil_version=\"not-set\",spec_version=\"not-set\"} 4/);
});
test('Should register intervals when client registered', async () => {
    eventBus.emit(metric_events_1.CLIENT_REGISTERED, {
        appName: 'unleash-client-node',
        environment: 'development',
        interval: '15',
    });
    const metrics = await prometheusRegister.getSingleMetricAsString('client_registration_total');
    expect(metrics).toMatch(/client_registration_total{appName=\"unleash-client-node\",environment=\"development\",interval=\"15\"} 1/);
});
test('Should not collect client sdk version if sdkVersion is of wrong format or non-existent', async () => {
    eventStore.emit(events_2.CLIENT_REGISTER, { sdkVersion: 'unleash-client-rust' });
    eventStore.emit(events_2.CLIENT_REGISTER, {});
    const metrics = await prometheusRegister.getSingleMetricAsString('client_sdk_versions');
    expect(metrics).not.toMatch(/unleash-client-rust/);
});
test('should collect metrics for project disabled numbers', async () => {
    eventStore.emit(events_2.PROJECT_ENVIRONMENT_REMOVED, {
        project: 'default',
        environment: 'staging',
        createdBy: 'Jay',
        createdByUserId: 26,
    });
    const recordedMetric = await prometheusRegister.getSingleMetricAsString('project_environments_disabled');
    expect(recordedMetric).toMatch(/project_environments_disabled{project_id=\"default\"} 1/);
});
test('should collect metrics for lifecycle', async () => {
    await db.stores.featureToggleStore.create('default', {
        name: 'my_feature_b',
        createdByUserId: 9999,
    });
    await featureLifeCycleStore.insert([
        {
            feature: 'my_feature_b',
            stage: 'initial',
        },
    ]);
    const stageCount = await featureLifeCycleReadModel.getStageCountByProject();
    const stageDurations = await featureLifeCycleReadModel.getAllWithStageDuration();
    expect(stageCount).toHaveLength(1);
    expect(stageDurations).toHaveLength(1);
    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(/feature_lifecycle_stage_duration/);
    expect(metrics).toMatch(/feature_lifecycle_stage_count_by_project/);
    expect(metrics).toMatch(/feature_lifecycle_stage_entered/);
});
test('should collect limit exceeded metrics', async () => {
    eventBus.emit(metric_events_1.EXCEEDS_LIMIT, {
        resource: 'feature flags',
        limit: '5000',
    });
    const recordedMetric = await prometheusRegister.getSingleMetricAsString('exceeds_limit_error');
    expect(recordedMetric).toMatch(/exceeds_limit_error{resource=\"feature flags\",limit=\"5000\"} 1/);
});
test('should collect traffic_total metrics', async () => {
    const recordedMetric = await prometheusRegister.getSingleMetricAsString('traffic_total');
    expect(recordedMetric).toMatch(/traffic_total 0/);
});
test('should collect licensed_users metrics', async () => {
    const recordedMetric = await prometheusRegister.getSingleMetricAsString('licensed_users');
    expect(recordedMetric).toMatch(/licensed_users 0/);
});
//# sourceMappingURL=metrics.test.js.map