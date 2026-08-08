"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../../test/e2e/helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../test/fixtures/no-logger"));
const test_config_1 = require("../../../test/config/test-config");
const events_1 = require("../../../lib/types/events");
const date_fns_1 = require("date-fns");
const features_1 = require("../../../lib/features");
const types_1 = require("../../../lib/types");
const createProjectInsightsService_1 = require("./createProjectInsightsService");
const util_1 = require("../../util");
let stores;
let db;
let projectService;
let projectInsightsService;
let eventService;
let featureToggleService;
let user; // many methods in this test use User instead of IUser
let opsUser;
beforeAll(async () => {
    db = await (0, database_init_1.default)('project_service_serial', no_logger_1.default);
    stores = db.stores;
    // @ts-ignore return type IUser type missing generateImageUrl
    user = await stores.userStore.insert({
        name: 'Some Name',
        email: 'test@getunleash.io',
    });
    opsUser = await stores.userStore.insert({
        name: 'Test user',
        email: 'test@example.com',
    });
    const config = (0, test_config_1.createTestConfig)({
        getLogger: no_logger_1.default,
    });
    eventService = (0, features_1.createEventsService)(db.rawDatabase, config);
    featureToggleService = (0, features_1.createFeatureToggleService)(db.rawDatabase, config);
    projectService = (0, features_1.createProjectService)(db.rawDatabase, config);
    projectInsightsService = (0, createProjectInsightsService_1.createProjectInsightsService)(db.rawDatabase, config);
});
afterAll(async () => {
    await db.destroy();
});
afterEach(async () => {
    await stores.eventStore.deleteAll();
});
const updateFeature = async (featureName, update) => {
    return db.rawDatabase
        .table('features')
        .update(update)
        .where({ name: featureName });
};
test('should return average time to production per toggle', async () => {
    const project = {
        id: 'average-time-to-prod-per-toggle',
        name: 'average-time-to-prod-per-toggle',
        mode: 'open',
        defaultStickiness: 'clientId',
    };
    await projectService.createProject(project, user, (0, util_1.extractAuditInfoFromUser)(user));
    const toggles = [
        { name: 'average-prod-time-pt', subdays: 7 },
        { name: 'average-prod-time-pt-2', subdays: 14 },
        { name: 'average-prod-time-pt-3', subdays: 40 },
        { name: 'average-prod-time-pt-4', subdays: 15 },
        { name: 'average-prod-time-pt-5', subdays: 2 },
    ];
    const featureToggles = await Promise.all(toggles.map((toggle) => {
        return featureToggleService.createFeatureToggle(project.id, toggle, (0, util_1.extractAuditInfoFromUser)(opsUser));
    }));
    await Promise.all(featureToggles.map((toggle) => {
        return eventService.storeEvent(new events_1.FeatureEnvironmentEvent({
            enabled: true,
            project: project.id,
            featureName: toggle.name,
            environment: 'default',
            auditUser: types_1.TEST_AUDIT_USER,
        }));
    }));
    await Promise.all(toggles.map((toggle) => updateFeature(toggle.name, {
        created_at: (0, date_fns_1.subDays)(new Date(), toggle.subdays),
    })));
    const result = await projectInsightsService.getDoraMetrics(project.id);
    expect(result.features).toHaveLength(5);
    expect(result.features[0].timeToProduction).toBeTruthy();
    expect(result.projectAverage).toBeTruthy();
});
test('should return average time to production per toggle for a specific project', async () => {
    const project1 = {
        id: 'average-time-to-prod-per-toggle-1',
        name: 'Project 1',
        mode: 'open',
        defaultStickiness: 'clientId',
    };
    const project2 = {
        id: 'average-time-to-prod-per-toggle-2',
        name: 'Project 2',
        mode: 'open',
        defaultStickiness: 'clientId',
    };
    await projectService.createProject(project1, user, (0, util_1.extractAuditInfoFromUser)(user));
    await projectService.createProject(project2, user, (0, util_1.extractAuditInfoFromUser)(user));
    const togglesProject1 = [
        { name: 'average-prod-time-pt-10', subdays: 7 },
        { name: 'average-prod-time-pt-11', subdays: 14 },
        { name: 'average-prod-time-pt-12', subdays: 40 },
    ];
    const togglesProject2 = [
        { name: 'average-prod-time-pt-13', subdays: 15 },
        { name: 'average-prod-time-pt-14', subdays: 2 },
    ];
    const featureTogglesProject1 = await Promise.all(togglesProject1.map((toggle) => {
        return featureToggleService.createFeatureToggle(project1.id, toggle, (0, util_1.extractAuditInfoFromUser)(opsUser));
    }));
    const featureTogglesProject2 = await Promise.all(togglesProject2.map((toggle) => {
        return featureToggleService.createFeatureToggle(project2.id, toggle, (0, util_1.extractAuditInfoFromUser)(opsUser));
    }));
    await Promise.all(featureTogglesProject1.map((toggle) => {
        return eventService.storeEvent(new events_1.FeatureEnvironmentEvent({
            enabled: true,
            project: project1.id,
            featureName: toggle.name,
            environment: 'default',
            auditUser: types_1.TEST_AUDIT_USER,
        }));
    }));
    await Promise.all(featureTogglesProject2.map((toggle) => {
        return eventService.storeEvent(new events_1.FeatureEnvironmentEvent({
            enabled: true,
            project: project2.id,
            featureName: toggle.name,
            environment: 'default',
            auditUser: types_1.TEST_AUDIT_USER,
        }));
    }));
    await Promise.all(togglesProject1.map((toggle) => updateFeature(toggle.name, {
        created_at: (0, date_fns_1.subDays)(new Date(), toggle.subdays),
    })));
    await Promise.all(togglesProject2.map((toggle) => updateFeature(toggle.name, {
        created_at: (0, date_fns_1.subDays)(new Date(), toggle.subdays),
    })));
    const resultProject1 = await projectInsightsService.getDoraMetrics(project1.id);
    const resultProject2 = await projectInsightsService.getDoraMetrics(project2.id);
    expect(resultProject1.features).toHaveLength(3);
    expect(resultProject2.features).toHaveLength(2);
});
test('should return average time to production per toggle and include archived toggles', async () => {
    const project1 = {
        id: 'average-time-to-prod-per-toggle-12',
        name: 'Project 1',
        mode: 'open',
        defaultStickiness: 'clientId',
    };
    await projectService.createProject(project1, user, (0, util_1.extractAuditInfoFromUser)(user));
    const togglesProject1 = [
        { name: 'average-prod-time-pta-10', subdays: 7 },
        { name: 'average-prod-time-pta-11', subdays: 14 },
        { name: 'average-prod-time-pta-12', subdays: 40 },
    ];
    const featureTogglesProject1 = await Promise.all(togglesProject1.map((toggle) => {
        return featureToggleService.createFeatureToggle(project1.id, toggle, (0, util_1.extractAuditInfoFromUser)(opsUser));
    }));
    await Promise.all(featureTogglesProject1.map((toggle) => {
        return eventService.storeEvent(new events_1.FeatureEnvironmentEvent({
            enabled: true,
            project: project1.id,
            featureName: toggle.name,
            environment: 'default',
            auditUser: types_1.TEST_AUDIT_USER,
        }));
    }));
    await Promise.all(togglesProject1.map((toggle) => updateFeature(toggle.name, {
        created_at: (0, date_fns_1.subDays)(new Date(), toggle.subdays),
    })));
    await featureToggleService.archiveToggle('average-prod-time-pta-12', user, (0, util_1.extractAuditInfoFromUser)(user));
    const resultProject1 = await projectInsightsService.getDoraMetrics(project1.id);
    expect(resultProject1.features).toHaveLength(3);
});
//# sourceMappingURL=project-insights-service.e2e.test.js.map