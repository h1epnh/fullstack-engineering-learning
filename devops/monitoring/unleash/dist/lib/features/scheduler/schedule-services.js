"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleServices = void 0;
const date_fns_1 = require("date-fns");
/**
 * Schedules service methods.
 *
 * In order to promote runtime control, you should **not use** a flagResolver inside this method. Instead, implement your flag usage inside the scheduled methods themselves.
 * @param services
 */
const scheduleServices = async (services, config) => {
    const { accountService, schedulerService, apiTokenService, instanceStatsService, clientInstanceService, projectService, projectHealthService, configurationRevisionService, eventAnnouncerService, featureToggleService, eventService, versionService, lastSeenService, frontendApiService, clientMetricsServiceV2, integrationEventsService, uniqueConnectionService, } = services;
    schedulerService.schedule(lastSeenService.cleanLastSeen.bind(lastSeenService), (0, date_fns_1.hoursToMilliseconds)(1), 'cleanLastSeen');
    schedulerService.schedule(lastSeenService.store.bind(lastSeenService), (0, date_fns_1.secondsToMilliseconds)(30), 'storeLastSeen');
    schedulerService.schedule(apiTokenService.fetchActiveTokens.bind(apiTokenService), (0, date_fns_1.minutesToMilliseconds)(1), 'fetchActiveTokens', 0);
    schedulerService.schedule(apiTokenService.updateLastSeen.bind(apiTokenService), (0, date_fns_1.minutesToMilliseconds)(3), 'updateLastSeen');
    // TODO this works fine for keeping labeledAppCounts up to date, but
    // it would be nice if we can keep client_apps_total prometheus metric
    // up to date. We'd need to have access to DbMetricsMonitor, which is
    // where the metric is registered and call an update only for that metric
    schedulerService.schedule(instanceStatsService.getLabeledAppCounts.bind(instanceStatsService), (0, date_fns_1.minutesToMilliseconds)(5), 'refreshAppCountSnapshot');
    schedulerService.schedule(clientInstanceService.removeInstancesOlderThanTwoDays.bind(clientInstanceService), (0, date_fns_1.hoursToMilliseconds)(24), 'removeInstancesOlderThanTwoDays');
    schedulerService.schedule(clientInstanceService.bulkAdd.bind(clientInstanceService), (0, date_fns_1.secondsToMilliseconds)(5), 'bulkAddInstances');
    schedulerService.schedule(clientInstanceService.announceUnannounced.bind(clientInstanceService), (0, date_fns_1.minutesToMilliseconds)(5), 'announceUnannounced');
    schedulerService.schedule(projectService.statusJob.bind(projectService), (0, date_fns_1.hoursToMilliseconds)(24), 'statusJob');
    schedulerService.schedule(projectHealthService.setHealthRating.bind(projectHealthService), (0, date_fns_1.hoursToMilliseconds)(1), 'setHealthRating');
    schedulerService.schedule(configurationRevisionService.updateMaxRevisionId.bind(configurationRevisionService), (0, date_fns_1.secondsToMilliseconds)(1), 'updateMaxRevisionId');
    schedulerService.schedule(eventAnnouncerService.publishUnannouncedEvents.bind(eventAnnouncerService), (0, date_fns_1.secondsToMilliseconds)(1), 'publishUnannouncedEvents');
    schedulerService.schedule(featureToggleService.updatePotentiallyStaleFeatures.bind(featureToggleService), (0, date_fns_1.minutesToMilliseconds)(1), 'updatePotentiallyStaleFeatures');
    schedulerService.schedule(() => versionService.checkLatestVersion(() => instanceStatsService.getFeatureUsageInfo()), (0, date_fns_1.hoursToMilliseconds)(48), 'checkLatestVersion');
    schedulerService.schedule(frontendApiService.fetchFrontendSettings.bind(frontendApiService), (0, date_fns_1.minutesToMilliseconds)(2), 'fetchFrontendSettings', 0);
    schedulerService.schedule(() => clientMetricsServiceV2.bulkAdd().catch(console.error), (0, date_fns_1.secondsToMilliseconds)(5), 'bulkAddMetrics');
    schedulerService.schedule(() => clientMetricsServiceV2.clearMetrics(48).catch(console.error), (0, date_fns_1.hoursToMilliseconds)(12), 'clearMetrics');
    schedulerService.schedule(accountService.updateLastSeen.bind(accountService), (0, date_fns_1.minutesToMilliseconds)(3), 'updateAccountLastSeen');
    if (config.server.enableScheduledCreatedByMigration) {
        schedulerService.schedule(eventService.setEventCreatedByUserId.bind(eventService), (0, date_fns_1.minutesToMilliseconds)(15), 'setEventCreatedByUserId');
        schedulerService.schedule(featureToggleService.setFeatureCreatedByUserIdFromEvents.bind(featureToggleService), (0, date_fns_1.minutesToMilliseconds)(15), 'setFeatureCreatedByUserIdFromEvents');
    }
    schedulerService.schedule(integrationEventsService.cleanUpEvents.bind(integrationEventsService), (0, date_fns_1.minutesToMilliseconds)(15), 'cleanUpIntegrationEvents');
    schedulerService.schedule(uniqueConnectionService.sync.bind(uniqueConnectionService), (0, date_fns_1.minutesToMilliseconds)(10), 'uniqueConnectionService');
};
exports.scheduleServices = scheduleServices;
//# sourceMappingURL=schedule-services.js.map