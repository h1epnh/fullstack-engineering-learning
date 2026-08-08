"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeInstanceStatsService = exports.createInstanceStatsService = void 0;
const instance_stats_service_1 = require("./instance-stats-service");
const getActiveUsers_1 = require("./getActiveUsers");
const getProductionChanges_1 = require("./getProductionChanges");
const feature_toggle_store_1 = __importDefault(require("../feature-toggle/feature-toggle-store"));
const user_store_1 = __importDefault(require("../../db/user-store"));
const project_store_1 = __importDefault(require("../project/project-store"));
const environment_store_1 = __importDefault(require("../project-environments/environment-store"));
const strategy_store_1 = __importDefault(require("../../db/strategy-store"));
const context_field_store_1 = __importDefault(require("../context/context-field-store"));
const group_store_1 = __importDefault(require("../../db/group-store"));
const segment_store_1 = __importDefault(require("../segment/segment-store"));
const role_store_1 = __importDefault(require("../../db/role-store"));
const setting_store_1 = __importDefault(require("../../db/setting-store"));
const client_instance_store_1 = __importDefault(require("../../db/client-instance-store"));
const event_store_1 = __importDefault(require("../events/event-store"));
const api_token_store_1 = require("../../db/api-token-store");
const client_metrics_store_v2_1 = require("../metrics/client-metrics/client-metrics-store-v2");
const version_service_1 = __importDefault(require("../../services/version-service"));
const feature_toggle_strategies_store_1 = __importDefault(require("../feature-toggle/feature-toggle-strategies-store"));
const fake_user_store_1 = __importDefault(require("../../../test/fixtures/fake-user-store"));
const fake_feature_toggle_store_1 = __importDefault(require("../feature-toggle/fakes/fake-feature-toggle-store"));
const fake_project_store_1 = __importDefault(require("../../../test/fixtures/fake-project-store"));
const fake_environment_store_1 = __importDefault(require("../project-environments/fake-environment-store"));
const fake_group_store_1 = __importDefault(require("../../../test/fixtures/fake-group-store"));
const fake_context_field_store_1 = __importDefault(require("../context/fake-context-field-store"));
const fake_role_store_1 = __importDefault(require("../../../test/fixtures/fake-role-store"));
const fake_client_instance_store_1 = __importDefault(require("../../../test/fixtures/fake-client-instance-store"));
const fake_client_metrics_store_v2_1 = __importDefault(require("../metrics/client-metrics/fake-client-metrics-store-v2"));
const fake_api_token_store_1 = __importDefault(require("../../../test/fixtures/fake-api-token-store"));
const fake_event_store_1 = __importDefault(require("../../../test/fixtures/fake-event-store"));
const fake_setting_store_1 = __importDefault(require("../../../test/fixtures/fake-setting-store"));
const fake_segment_store_1 = __importDefault(require("../../../test/fixtures/fake-segment-store"));
const fake_strategies_store_1 = __importDefault(require("../../../test/fixtures/fake-strategies-store"));
const fake_feature_strategies_store_1 = __importDefault(require("../feature-toggle/fakes/fake-feature-strategies-store"));
const feature_strategies_read_model_1 = require("../feature-toggle/feature-strategies-read-model");
const fake_feature_strategies_read_model_1 = require("../feature-toggle/fake-feature-strategies-read-model");
const traffic_data_usage_store_1 = require("../traffic-data-usage/traffic-data-usage-store");
const fake_traffic_data_usage_store_1 = require("../traffic-data-usage/fake-traffic-data-usage-store");
const getLicensedUsers_1 = require("./getLicensedUsers");
const createInstanceStatsService = (db, config) => {
    const { eventBus, getLogger, flagResolver } = config;
    const featureToggleStore = new feature_toggle_store_1.default(db, eventBus, getLogger, flagResolver);
    const userStore = new user_store_1.default(db, getLogger, flagResolver);
    const projectStore = new project_store_1.default(db, eventBus, config);
    const environmentStore = new environment_store_1.default(db, eventBus, config);
    const strategyStore = new strategy_store_1.default(db, getLogger);
    const contextFieldStore = new context_field_store_1.default(db, getLogger, flagResolver);
    const groupStore = new group_store_1.default(db);
    const segmentStore = new segment_store_1.default(db, eventBus, getLogger, flagResolver);
    const roleStore = new role_store_1.default(db, eventBus, getLogger);
    const settingStore = new setting_store_1.default(db, getLogger);
    const clientInstanceStore = new client_instance_store_1.default(db, eventBus, getLogger);
    const eventStore = new event_store_1.default(db, getLogger);
    const apiTokenStore = new api_token_store_1.ApiTokenStore(db, eventBus, getLogger, flagResolver);
    const clientMetricsStoreV2 = new client_metrics_store_v2_1.ClientMetricsStoreV2(db, getLogger, flagResolver);
    const featureStrategiesReadModel = new feature_strategies_read_model_1.FeatureStrategiesReadModel(db);
    const trafficDataUsageStore = new traffic_data_usage_store_1.TrafficDataUsageStore(db, getLogger);
    const featureStrategiesStore = new feature_toggle_strategies_store_1.default(db, eventBus, getLogger, flagResolver);
    const instanceStatsServiceStores = {
        featureToggleStore,
        userStore,
        projectStore,
        environmentStore,
        strategyStore,
        contextFieldStore,
        groupStore,
        segmentStore,
        roleStore,
        settingStore,
        clientInstanceStore,
        eventStore,
        apiTokenStore,
        clientMetricsStoreV2,
        featureStrategiesReadModel,
        featureStrategiesStore,
        trafficDataUsageStore,
    };
    const versionServiceStores = { settingStore };
    const getActiveUsers = (0, getActiveUsers_1.createGetActiveUsers)(db);
    const getProductionChanges = (0, getProductionChanges_1.createGetProductionChanges)(db);
    const getLicencedUsers = (0, getLicensedUsers_1.createGetLicensedUsers)(db);
    const versionService = new version_service_1.default(versionServiceStores, config);
    const instanceStatsService = new instance_stats_service_1.InstanceStatsService(instanceStatsServiceStores, config, versionService, getActiveUsers, getProductionChanges, getLicencedUsers);
    return instanceStatsService;
};
exports.createInstanceStatsService = createInstanceStatsService;
const createFakeInstanceStatsService = (config) => {
    const { eventBus, getLogger, flagResolver } = config;
    const featureToggleStore = new fake_feature_toggle_store_1.default();
    const userStore = new fake_user_store_1.default();
    const projectStore = new fake_project_store_1.default();
    const environmentStore = new fake_environment_store_1.default();
    const strategyStore = new fake_strategies_store_1.default();
    const contextFieldStore = new fake_context_field_store_1.default();
    const groupStore = new fake_group_store_1.default();
    const segmentStore = new fake_segment_store_1.default();
    const roleStore = new fake_role_store_1.default();
    const settingStore = new fake_setting_store_1.default();
    const clientInstanceStore = new fake_client_instance_store_1.default();
    const eventStore = new fake_event_store_1.default();
    const apiTokenStore = new fake_api_token_store_1.default();
    const clientMetricsStoreV2 = new fake_client_metrics_store_v2_1.default();
    const featureStrategiesReadModel = new fake_feature_strategies_read_model_1.FakeFeatureStrategiesReadModel();
    const trafficDataUsageStore = new fake_traffic_data_usage_store_1.FakeTrafficDataUsageStore();
    const featureStrategiesStore = new fake_feature_strategies_store_1.default();
    const instanceStatsServiceStores = {
        featureToggleStore,
        userStore,
        projectStore,
        environmentStore,
        strategyStore,
        contextFieldStore,
        groupStore,
        segmentStore,
        roleStore,
        settingStore,
        clientInstanceStore,
        eventStore,
        apiTokenStore,
        clientMetricsStoreV2,
        featureStrategiesReadModel,
        featureStrategiesStore,
        trafficDataUsageStore,
    };
    const versionServiceStores = { settingStore };
    const getActiveUsers = (0, getActiveUsers_1.createFakeGetActiveUsers)();
    const getLicensedUsers = (0, getLicensedUsers_1.createFakeGetLicensedUsers)();
    const getProductionChanges = (0, getProductionChanges_1.createFakeGetProductionChanges)();
    const versionService = new version_service_1.default(versionServiceStores, config);
    const instanceStatsService = new instance_stats_service_1.InstanceStatsService(instanceStatsServiceStores, config, versionService, getActiveUsers, getProductionChanges, getLicensedUsers);
    return instanceStatsService;
};
exports.createFakeInstanceStatsService = createFakeInstanceStatsService;
//# sourceMappingURL=createInstanceStatsService.js.map