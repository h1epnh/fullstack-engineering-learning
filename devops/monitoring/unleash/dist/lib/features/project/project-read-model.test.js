"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../../test/e2e/helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../test/fixtures/no-logger"));
const project_read_model_1 = require("./project-read-model");
let db;
let flagStore;
let projectStore;
let eventStore;
let projectReadModel;
let lastSeenStore;
const alwaysOnFlagResolver = {
    isEnabled() {
        return true;
    },
};
beforeAll(async () => {
    db = await (0, database_init_1.default)('feature_lifecycle_read_model', no_logger_1.default);
    projectReadModel = new project_read_model_1.ProjectReadModel(db.rawDatabase, { emit: () => { } }, alwaysOnFlagResolver);
    projectStore = db.stores.projectStore;
    eventStore = db.stores.eventStore;
    flagStore = db.stores.featureToggleStore;
    lastSeenStore = db.stores.lastSeenStore;
});
afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});
beforeEach(async () => {
    await projectStore.deleteAll();
    await flagStore.deleteAll();
    await eventStore.deleteAll();
});
test("it doesn't count flags multiple times when they have multiple events associated with them", async () => {
    const projectId = 'project';
    const flagName = 'flag';
    await projectStore.create({ id: projectId, name: projectId });
    await flagStore.create(projectId, { name: flagName, createdByUserId: 1 });
    await eventStore.store({
        type: 'feature-created',
        createdBy: 'admin',
        ip: '',
        createdByUserId: 1,
        featureName: flagName,
        project: projectId,
    });
    await eventStore.store({
        type: 'feature-updated',
        createdBy: 'admin',
        ip: '',
        createdByUserId: 1,
        featureName: flagName,
        project: projectId,
    });
    const withFlags = await projectReadModel.getProjectsForAdminUi();
    expect(withFlags).toMatchObject([{ id: projectId, featureCount: 1 }]);
    const insightsQuery = await projectReadModel.getProjectsForInsights();
    expect(insightsQuery).toMatchObject([{ id: projectId, featureCount: 1 }]);
});
test('it uses the last flag change for an flag in the project as lastUpdated', async () => {
    const projectId = 'project';
    const flagName = 'flag';
    await projectStore.create({ id: projectId, name: projectId });
    await eventStore.store({
        type: 'project-created',
        createdBy: 'admin',
        createdByUserId: 1,
        project: projectId,
        ip: '',
    });
    const noEvents = await projectReadModel.getProjectsForAdminUi();
    expect(noEvents[0].lastUpdatedAt).toBeNull();
    await flagStore.create(projectId, { name: flagName, createdByUserId: 1 });
    await eventStore.store({
        type: 'feature-created',
        createdBy: 'admin',
        ip: '',
        createdByUserId: 1,
        featureName: flagName,
        project: projectId,
    });
    const withEvents = await projectReadModel.getProjectsForAdminUi();
    expect(withEvents[0].lastUpdatedAt).not.toBeNull();
});
test('it does not consider flag events in a different project for lastUpdatedAt, and does not count flags belonging to a different project', async () => {
    const projectId1 = 'project1';
    await projectStore.create({ id: projectId1, name: 'Project1' });
    const projectId2 = 'project2';
    await projectStore.create({ id: projectId2, name: 'Project2' });
    const flagName = 'flag';
    await flagStore.create(projectId1, { name: flagName, createdByUserId: 1 });
    await eventStore.store({
        type: 'feature-created',
        createdBy: 'admin',
        ip: '',
        createdByUserId: 1,
        featureName: flagName,
        project: projectId2,
    });
    const withEvents = await projectReadModel.getProjectsForAdminUi();
    expect(withEvents).toMatchObject([
        // no events for the flag in this project (i.e. if a flag
        // has been moved from one project to the next (before the
        // moving event has been counted)). In practice, you'll
        // always get a "feature-project-change" event to count
        { id: projectId1, lastUpdatedAt: null },
        // this flag no longer exists in this project because it
        // has been moved, so it should not be counted
        { id: projectId2, lastUpdatedAt: null },
    ]);
});
test('it uses the last flag metrics received for lastReportedFlagUsage', async () => {
    const projectId = 'project';
    const flagName = 'flag';
    await projectStore.create({ id: projectId, name: projectId });
    const noUsage = await projectReadModel.getProjectsForAdminUi();
    expect(noUsage[0].lastReportedFlagUsage).toBeNull();
    await flagStore.create(projectId, { name: flagName, createdByUserId: 1 });
    await lastSeenStore.setLastSeen([
        { featureName: flagName, environment: 'development' },
    ]);
    const result = await projectReadModel.getProjectsForAdminUi();
    expect(result[0].lastReportedFlagUsage).not.toBeNull();
});
//# sourceMappingURL=project-read-model.test.js.map