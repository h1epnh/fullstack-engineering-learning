"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("../../../types/events");
const schema_1 = require("../shared/schema");
const schema_2 = require("../shared/schema");
const types_1 = require("../../../types");
const util_1 = require("../../../util");
const findOutdatedSdks_1 = require("./findOutdatedSdks");
const metric_events_1 = require("../../../metric-events");
const error_1 = require("../../../error");
class ClientInstanceService {
    constructor({ clientMetricsStoreV2, strategyStore, featureToggleStore, clientInstanceStore, clientApplicationsStore, eventStore, }, { getLogger, flagResolver, eventBus, }, privateProjectChecker) {
        this.apps = {};
        this.seenClients = {};
        this.clientMetricsStoreV2 = clientMetricsStoreV2;
        this.strategyStore = strategyStore;
        this.featureToggleStore = featureToggleStore;
        this.clientApplicationsStore = clientApplicationsStore;
        this.clientInstanceStore = clientInstanceStore;
        this.eventStore = eventStore;
        this.eventBus = eventBus;
        this.privateProjectChecker = privateProjectChecker;
        this.flagResolver = flagResolver;
        this.logger = getLogger('/services/client-metrics/client-instance-service.ts');
    }
    async registerInstance(data, clientIp) {
        const value = await schema_2.clientMetricsSchema.validateAsync(data);
        await this.clientInstanceStore.setLastSeen({
            appName: value.appName,
            instanceId: value.instanceId,
            environment: value.environment,
            clientIp: clientIp,
        });
    }
    async registerClient(data, clientIp) {
        const value = await schema_1.clientRegisterSchema.validateAsync(data);
        value.clientIp = clientIp;
        value.createdBy = types_1.SYSTEM_USER.username;
        this.seenClients[this.clientKey(value)] = value;
        this.eventBus.emit(metric_events_1.CLIENT_REGISTERED, value);
        if (value.sdkVersion && value.sdkVersion.indexOf(':') > -1) {
            const [sdkName, sdkVersion] = value.sdkVersion.split(':');
            const heartbeatEvent = {
                sdkName,
                sdkVersion,
                metadata: {
                    platformName: data.platformName,
                    platformVersion: data.platformVersion,
                    yggdrasilVersion: data.yggdrasilVersion,
                    specVersion: data.specVersion,
                },
            };
            this.eventStore.emit(events_1.CLIENT_REGISTER, heartbeatEvent);
        }
    }
    async announceUnannounced() {
        if (this.clientApplicationsStore) {
            const appsToAnnounce = await this.clientApplicationsStore.setUnannouncedToAnnounced();
            if (appsToAnnounce.length > 0) {
                const events = appsToAnnounce.map((app) => ({
                    type: events_1.APPLICATION_CREATED,
                    createdBy: app.createdBy || types_1.SYSTEM_USER.username,
                    data: app,
                    createdByUserId: app.createdByUserId || types_1.SYSTEM_USER.id,
                    ip: '', // TODO: fix this, how do we get the ip from the client? This comes from a row in the DB
                }));
                await this.eventStore.batchStore(events);
            }
        }
    }
    clientKey(client) {
        return `${client.appName}_${client.instanceId}`;
    }
    async bulkAdd() {
        if (this &&
            this.seenClients &&
            this.clientApplicationsStore &&
            this.clientInstanceStore) {
            const uniqueRegistrations = Object.values(this.seenClients);
            const uniqueApps = Object.values(uniqueRegistrations.reduce((soFar, reg) => {
                // eslint-disable-next-line no-param-reassign
                soFar[reg.appName] = reg;
                return soFar;
            }, {}));
            this.seenClients = {};
            try {
                if (uniqueRegistrations.length > 0) {
                    await this.clientApplicationsStore.bulkUpsert(uniqueApps);
                    await this.clientInstanceStore.bulkUpsert(uniqueRegistrations);
                }
            }
            catch (err) {
                this.logger.warn('Failed to register clients', err);
            }
        }
    }
    async getApplications(query, userId) {
        const applications = await this.clientApplicationsStore.getApplications({ ...query, sortBy: query.sortBy || 'appName' });
        const accessibleProjects = await this.privateProjectChecker.getUserAccessibleProjects(userId);
        if (accessibleProjects.mode === 'all') {
            return applications;
        }
        else {
            return {
                applications: applications.applications.map((application) => {
                    return {
                        ...application,
                        usage: application.usage?.filter((usageItem) => usageItem.project === util_1.ALL_PROJECTS ||
                            accessibleProjects.projects.includes(usageItem.project)),
                    };
                }),
                total: applications.total,
            };
        }
    }
    async getApplication(appName) {
        const [seenToggles, application, instances, strategies, features] = await Promise.all([
            this.clientMetricsStoreV2.getSeenTogglesForApp(appName),
            this.clientApplicationsStore.get(appName),
            this.clientInstanceStore.getByAppName(appName),
            this.strategyStore.getAll(),
            this.featureToggleStore.getAll(),
        ]);
        if (application === undefined) {
            throw new error_1.NotFoundError(`Could not find application with appName ${appName}`);
        }
        return {
            appName: application.appName,
            createdAt: application.createdAt,
            description: application.description,
            url: application.url,
            color: application.color,
            icon: application.icon,
            strategies: application.strategies.map((name) => {
                const found = strategies.find((f) => f.name === name);
                return found || { name, notFound: true };
            }),
            instances,
            seenToggles: seenToggles.map((name) => {
                const found = features.find((f) => f.name === name);
                return found || { name, notFound: true };
            }),
            links: {
                self: `/api/applications/${application.appName}`,
            },
        };
    }
    async getApplicationOverview(appName, userId) {
        const result = await this.clientApplicationsStore.getApplicationOverview(appName);
        const accessibleProjects = await this.privateProjectChecker.filterUserAccessibleProjects(userId, result.projects);
        result.projects = accessibleProjects;
        result.environments.forEach((environment) => {
            environment.issues.outdatedSdks = (0, findOutdatedSdks_1.findOutdatedSDKs)(environment.sdks);
        });
        return result;
    }
    async getRecentApplicationEnvironmentInstances(appName, environment) {
        const instances = await this.clientInstanceStore.getRecentByAppNameAndEnvironment(appName, environment);
        return instances.map((instance) => ({
            instanceId: instance.instanceId,
            clientIp: instance.clientIp,
            sdkVersion: instance.sdkVersion,
            lastSeen: instance.lastSeen,
        }));
    }
    async deleteApplication(appName) {
        await this.clientInstanceStore.deleteForApplication(appName);
        await this.clientApplicationsStore.delete(appName);
    }
    async createApplication(input) {
        await this.clientApplicationsStore.upsert(input);
    }
    async removeInstancesOlderThanTwoDays() {
        return this.clientInstanceStore.removeInstancesOlderThanTwoDays();
    }
    async getOutdatedSdks() {
        const sdkApps = await this.clientInstanceStore.groupApplicationsBySdk();
        return sdkApps.filter((sdkApp) => (0, findOutdatedSdks_1.isOutdatedSdk)(sdkApp.sdkVersion));
    }
    async getOutdatedSdksByProject(projectId) {
        const sdkApps = await this.clientInstanceStore.groupApplicationsBySdkAndProject(projectId);
        return sdkApps.filter((sdkApp) => (0, findOutdatedSdks_1.isOutdatedSdk)(sdkApp.sdkVersion));
    }
    async usesSdkOlderThan(sdkName, sdkVersion) {
        const semver = (0, util_1.parseStrictSemVer)(sdkVersion);
        const instancesOfSdk = await this.clientInstanceStore.getBySdkName(sdkName);
        return instancesOfSdk.some((instance) => {
            if (instance.sdkVersion) {
                const [_sdkName, sdkVersion] = instance.sdkVersion.split(':');
                const instanceUsedSemver = (0, util_1.parseStrictSemVer)(sdkVersion);
                return (instanceUsedSemver !== null &&
                    semver !== null &&
                    instanceUsedSemver < semver);
            }
        });
    }
}
exports.default = ClientInstanceService;
//# sourceMappingURL=instance-service.js.map