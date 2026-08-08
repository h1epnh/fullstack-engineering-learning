"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstanceStatsService = void 0;
const js_sha256_1 = require("js-sha256");
const types_1 = require("../../types");
const util_1 = require("../../util");
const date_fns_1 = require("date-fns");
const memoizee_1 = __importDefault(require("memoizee"));
class InstanceStatsService {
    constructor({ featureToggleStore, userStore, projectStore, environmentStore, strategyStore, contextFieldStore, groupStore, segmentStore, roleStore, settingStore, clientInstanceStore, eventStore, apiTokenStore, clientMetricsStoreV2, featureStrategiesReadModel, featureStrategiesStore, trafficDataUsageStore, }, { getLogger, flagResolver, }, versionService, getActiveUsers, getProductionChanges, getLicencedUsers) {
        this.memory = new Map();
        this.strategyStore = strategyStore;
        this.userStore = userStore;
        this.featureToggleStore = featureToggleStore;
        this.environmentStore = environmentStore;
        this.projectStore = projectStore;
        this.groupStore = groupStore;
        this.contextFieldStore = contextFieldStore;
        this.segmentStore = segmentStore;
        this.roleStore = roleStore;
        this.versionService = versionService;
        this.settingStore = settingStore;
        this.eventStore = eventStore;
        this.clientInstanceStore = clientInstanceStore;
        this.logger = getLogger('services/stats-service.js');
        this.getActiveUsers = () => this.memorize('getActiveUsers', getActiveUsers.bind(this));
        this.getLicencedUsers = () => this.memorize('getLicencedUsers', getLicencedUsers.bind(this));
        this.getProductionChanges = () => this.memorize('getProductionChanges', getProductionChanges.bind(this));
        this.apiTokenStore = apiTokenStore;
        this.clientMetricsStore = clientMetricsStoreV2;
        this.flagResolver = flagResolver;
        this.featureStrategiesReadModel = featureStrategiesReadModel;
        this.featureStrategiesStore = featureStrategiesStore;
        this.trafficDataUsageStore = trafficDataUsageStore;
    }
    memorize(key, fn) {
        const variant = this.flagResolver.getVariant('memorizeStats', {
            memoryKey: key,
        });
        if (variant.feature_enabled) {
            const minutes = variant.payload?.type === 'number'
                ? Number(variant.payload.value)
                : 1;
            let memoizedFunction = this.memory.get(key);
            if (!memoizedFunction) {
                memoizedFunction = (0, memoizee_1.default)(() => fn(), {
                    promise: true,
                    maxAge: (0, date_fns_1.minutesToMilliseconds)(minutes),
                });
                this.memory.set(key, memoizedFunction);
            }
            return memoizedFunction();
        }
        else {
            return fn();
        }
    }
    getProjectModeCount() {
        return this.memorize('getProjectModeCount', () => this.projectStore.getProjectModeCounts());
    }
    getToggleCount() {
        return this.memorize('getToggleCount', () => this.featureToggleStore.count({
            archived: false,
        }));
    }
    getArchivedToggleCount() {
        return this.memorize('hasOIDC', () => this.featureToggleStore.count({
            archived: true,
        }));
    }
    async hasOIDC() {
        return this.memorize('hasOIDC', async () => {
            const settings = await this.settingStore.get('unleash.enterprise.auth.oidc');
            return settings?.enabled || false;
        });
    }
    async hasSAML() {
        return this.memorize('hasSAML', async () => {
            const settings = await this.settingStore.get('unleash.enterprise.auth.saml');
            return settings?.enabled || false;
        });
    }
    async hasPasswordAuth() {
        return this.memorize('hasPasswordAuth', async () => {
            const settings = await this.settingStore.get('unleash.auth.simple');
            return (typeof settings?.disabled === 'undefined' ||
                settings.disabled === false);
        });
    }
    async hasSCIM() {
        return this.memorize('hasSCIM', async () => {
            const settings = await this.settingStore.get('scim');
            return settings?.enabled || false;
        });
    }
    async getStats() {
        const versionInfo = await this.versionService.getVersionInfo();
        const [featureToggles, archivedFeatureToggles, users, serviceAccounts, apiTokens, activeUsers, licensedUsers, projects, contextFields, groups, roles, customRootRoles, customRootRolesInUse, environments, segments, strategies, SAMLenabled, OIDCenabled, passwordAuthEnabled, SCIMenabled, clientApps, featureExports, featureImports, productionChanges, previousDayMetricsBucketsCount, maxEnvironmentStrategies, maxConstraintValues, maxConstraints,] = await Promise.all([
            this.getToggleCount(),
            this.getArchivedToggleCount(),
            this.getRegisteredUsers(),
            this.countServiceAccounts(),
            this.countApiTokensByType(),
            this.getActiveUsers(),
            this.getLicencedUsers(),
            this.getProjectModeCount(),
            this.contextFieldCount(),
            this.groupCount(),
            this.roleCount(),
            this.customRolesCount(),
            this.customRolesCountInUse(),
            this.environmentCount(),
            this.segmentCount(),
            this.strategiesCount(),
            this.hasSAML(),
            this.hasOIDC(),
            this.hasPasswordAuth(),
            this.hasSCIM(),
            this.appCount ? this.appCount : this.getLabeledAppCounts(),
            this.featuresExported(),
            this.featuresImported(),
            this.getProductionChanges(),
            this.countPreviousDayHourlyMetricsBuckets(),
            this.memorize('maxFeatureEnvironmentStrategies', this.featureStrategiesReadModel.getMaxFeatureEnvironmentStrategies.bind(this.featureStrategiesReadModel)),
            this.memorize('maxConstraintValues', this.featureStrategiesReadModel.getMaxConstraintValues.bind(this.featureStrategiesReadModel)),
            this.memorize('maxConstraintsPerStrategy', this.featureStrategiesReadModel.getMaxConstraintsPerStrategy.bind(this.featureStrategiesReadModel)),
        ]);
        return {
            timestamp: new Date(),
            instanceId: versionInfo.instanceId,
            versionOSS: versionInfo.current.oss,
            versionEnterprise: versionInfo.current.enterprise,
            users,
            serviceAccounts,
            apiTokens,
            activeUsers,
            licensedUsers,
            featureToggles,
            archivedFeatureToggles,
            projects,
            contextFields,
            roles,
            customRootRoles,
            customRootRolesInUse,
            groups,
            environments,
            segments,
            strategies,
            SAMLenabled,
            OIDCenabled,
            passwordAuthEnabled,
            SCIMenabled,
            clientApps: Object.entries(clientApps).map(([range, count]) => ({
                range: range,
                count,
            })),
            featureExports,
            featureImports,
            productionChanges,
            previousDayMetricsBucketsCount,
            maxEnvironmentStrategies: maxEnvironmentStrategies?.count ?? 0,
            maxConstraintValues: maxConstraintValues?.count ?? 0,
            maxConstraints: maxConstraints?.count ?? 0,
        };
    }
    async getFeatureUsageInfo() {
        const [featureToggles, users, projectModeCount, contextFields, groups, roles, customRootRoles, customRootRolesInUse, environments, segments, strategies, SAMLenabled, OIDCenabled, featureExports, featureImports, customStrategies, customStrategiesInUse, userActive, productionChanges, postgresVersion,] = await Promise.all([
            this.getToggleCount(),
            this.getRegisteredUsers(),
            this.getProjectModeCount(),
            this.contextFieldCount(),
            this.groupCount(),
            this.roleCount(),
            this.customRolesCount(),
            this.customRolesCountInUse(),
            this.environmentCount(),
            this.segmentCount(),
            this.strategiesCount(),
            this.hasSAML(),
            this.hasOIDC(),
            this.featuresExported(),
            this.featuresImported(),
            this.customStrategiesCount(),
            this.customStrategiesInUseCount(),
            this.getActiveUsers(),
            this.getProductionChanges(),
            this.postgresVersion(),
        ]);
        const versionInfo = await this.versionService.getVersionInfo();
        const featureInfo = {
            featureToggles,
            users,
            projects: projectModeCount
                .map((p) => p.count)
                .reduce((a, b) => a + b, 0),
            contextFields,
            groups,
            roles,
            customRootRoles,
            customRootRolesInUse,
            environments,
            segments,
            strategies,
            SAMLenabled,
            OIDCenabled,
            featureExports,
            featureImports,
            customStrategies,
            customStrategiesInUse,
            instanceId: versionInfo.instanceId,
            versionOSS: versionInfo.current.oss,
            versionEnterprise: versionInfo.current.enterprise,
            activeUsers30: userActive.last30,
            activeUsers60: userActive.last60,
            activeUsers90: userActive.last90,
            productionChanges30: productionChanges.last30,
            productionChanges60: productionChanges.last60,
            productionChanges90: productionChanges.last90,
            postgresVersion,
        };
        return featureInfo;
    }
    featuresExported() {
        return this.memorize('deprecatedFilteredCountFeaturesExported', () => this.eventStore.deprecatedFilteredCount({
            type: types_1.FEATURES_EXPORTED,
        }));
    }
    featuresImported() {
        return this.memorize('deprecatedFilteredCountFeaturesImported', () => this.eventStore.deprecatedFilteredCount({
            type: types_1.FEATURES_IMPORTED,
        }));
    }
    customStrategiesCount() {
        return this.memorize('customStrategiesCount', async () => (await this.strategyStore.getEditableStrategies()).length);
    }
    customStrategiesInUseCount() {
        return this.memorize('customStrategiesInUseCount', async () => await this.featureStrategiesStore.getCustomStrategiesInUseCount());
    }
    postgresVersion() {
        return this.memorize('postgresVersion', () => this.settingStore.postgresVersion());
    }
    groupCount() {
        return this.memorize('groupCount', () => this.groupStore.count());
    }
    roleCount() {
        return this.memorize('roleCount', () => this.roleStore.count());
    }
    customRolesCount() {
        return this.memorize('customRolesCount', () => this.roleStore.filteredCount({ type: util_1.CUSTOM_ROOT_ROLE_TYPE }));
    }
    customRolesCountInUse() {
        return this.memorize('customRolesCountInUse', () => this.roleStore.filteredCountInUse({
            type: util_1.CUSTOM_ROOT_ROLE_TYPE,
        }));
    }
    segmentCount() {
        return this.memorize('segmentCount', () => this.segmentStore.count());
    }
    contextFieldCount() {
        return this.memorize('contextFieldCount', () => this.contextFieldStore.count());
    }
    strategiesCount() {
        return this.memorize('strategiesCount', () => this.strategyStore.count());
    }
    environmentCount() {
        return this.memorize('environmentCount', () => this.environmentStore.count());
    }
    countPreviousDayHourlyMetricsBuckets() {
        return this.memorize('countPreviousDayHourlyMetricsBuckets', () => this.clientMetricsStore.countPreviousDayHourlyMetricsBuckets());
    }
    countApiTokensByType() {
        return this.memorize('countApiTokensByType', () => this.apiTokenStore.countByType());
    }
    getRegisteredUsers() {
        return this.memorize('getRegisteredUsers', () => this.userStore.count());
    }
    countServiceAccounts() {
        return this.memorize('countServiceAccounts', () => this.userStore.countServiceAccounts());
    }
    async getCurrentTrafficData() {
        return this.memorize('getCurrentTrafficData', async () => {
            const traffic = await this.trafficDataUsageStore.getTrafficDataUsageForPeriod((0, date_fns_1.format)(new Date(), 'yyyy-MM'));
            const counts = traffic.map((item) => item.count);
            return counts.reduce((total, current) => total + current, 0);
        });
    }
    async getLabeledAppCounts() {
        return this.memorize('getLabeledAppCounts', async () => {
            const [t7d, t30d, allTime] = await Promise.all([
                this.clientInstanceStore.getDistinctApplicationsCount(7),
                this.clientInstanceStore.getDistinctApplicationsCount(30),
                this.clientInstanceStore.getDistinctApplicationsCount(),
            ]);
            this.appCount = {
                '7d': t7d,
                '30d': t30d,
                allTime,
            };
            return this.appCount;
        });
    }
    getAppCountSnapshot(range) {
        return this.appCount?.[range];
    }
    async getSignedStats() {
        const instanceStats = await this.getStats();
        const totalProjects = instanceStats.projects
            .map((p) => p.count)
            .reduce((a, b) => a + b, 0);
        const sum = (0, js_sha256_1.sha256)(`${instanceStats.instanceId}${instanceStats.users}${instanceStats.featureToggles}${totalProjects}${instanceStats.roles}${instanceStats.groups}${instanceStats.environments}${instanceStats.segments}`);
        return { ...instanceStats, sum, projects: totalProjects };
    }
}
exports.InstanceStatsService = InstanceStatsService;
//# sourceMappingURL=instance-stats-service.js.map