"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const environment_service_1 = __importDefault(require("./environment-service"));
const test_config_1 = require("../../../test/config/test-config");
const database_init_1 = __importDefault(require("../../../test/e2e/helpers/database-init"));
const notfound_error_1 = __importDefault(require("../../error/notfound-error"));
const types_1 = require("../../types");
const name_exists_error_1 = __importDefault(require("../../error/name-exists-error"));
const createEventsService_1 = require("../events/createEventsService");
let stores;
let db;
let service;
let eventService;
beforeAll(async () => {
    const flags = {
        flags: { globalChangeRequestConfig: true },
    };
    const config = (0, test_config_1.createTestConfig)({
        experimental: flags,
    });
    db = await (0, database_init_1.default)('environment_service_serial', config.getLogger, {
        dbInitMethod: 'legacy',
        experimental: flags,
    });
    stores = db.stores;
    eventService = (0, createEventsService_1.createEventsService)(db.rawDatabase, config);
    service = new environment_service_1.default(stores, config, eventService);
});
afterAll(async () => {
    await db.destroy();
});
test('Can get environment', async () => {
    const created = await db.stores.environmentStore.create({
        name: 'testenv',
        type: 'production',
    });
    const retrieved = await service.get('testenv');
    expect(retrieved).toEqual(created);
});
test('Can get all', async () => {
    await db.stores.environmentStore.create({
        name: 'testenv2',
        type: 'production',
    });
    const environments = await service.getAll();
    expect(environments).toHaveLength(3); // the one we created plus 'default'
});
test('Can manage required approvals', async () => {
    const created = await db.stores.environmentStore.create({
        name: 'approval_env',
        type: 'production',
        requiredApprovals: 1,
    });
    const retrieved = await service.get('approval_env');
    await db.stores.environmentStore.update({
        type: 'production',
        protected: false,
        requiredApprovals: 2,
    }, 'approval_env');
    const updated = await service.get('approval_env');
    const groupRetrieved = (await service.getAll()).find((env) => env.name === 'approval_env');
    expect(retrieved).toEqual(created);
    expect(updated).toEqual({ ...created, requiredApprovals: 2 });
    expect(groupRetrieved).toMatchObject({ ...created, requiredApprovals: 2 });
});
test('Can connect environment to project', async () => {
    await db.stores.environmentStore.create({
        name: 'test-connection',
        type: 'production',
    });
    await stores.featureToggleStore.create('default', {
        name: 'test-connection',
        type: 'release',
        description: '',
        stale: false,
        createdByUserId: 9999,
    });
    await service.addEnvironmentToProject('test-connection', 'default', types_1.SYSTEM_USER_AUDIT);
    const overview = await stores.featureStrategiesStore.getFeatureOverview({
        projectId: 'default',
    });
    overview.forEach((f) => {
        expect(f.environments).toEqual([
            {
                name: 'test-connection',
                enabled: false,
                sortOrder: 9999,
                type: 'production',
                variantCount: 0,
                lastSeenAt: null,
                hasStrategies: false,
                hasEnabledStrategies: false,
            },
        ]);
    });
    const { events } = await eventService.getEvents();
    expect(events[0]).toMatchObject({
        type: 'project-environment-added',
        project: 'default',
        environment: 'test-connection',
        createdBy: types_1.SYSTEM_USER.username,
        createdByUserId: types_1.SYSTEM_USER.id,
    });
});
test('Can remove environment from project', async () => {
    await db.stores.environmentStore.create({
        name: 'removal-test',
        type: 'production',
    });
    await stores.featureToggleStore.create('default', {
        name: 'removal-test',
        createdByUserId: 9999,
    });
    await service.removeEnvironmentFromProject('test-connection', 'default', types_1.SYSTEM_USER_AUDIT);
    await service.addEnvironmentToProject('removal-test', 'default', types_1.SYSTEM_USER_AUDIT);
    let overview = await stores.featureStrategiesStore.getFeatureOverview({
        projectId: 'default',
    });
    expect(overview.length).toBeGreaterThan(0);
    overview.forEach((f) => {
        expect(f.environments).toEqual([
            {
                name: 'removal-test',
                enabled: false,
                sortOrder: 9999,
                type: 'production',
                variantCount: 0,
                lastSeenAt: null,
                hasStrategies: false,
                hasEnabledStrategies: false,
            },
        ]);
    });
    await service.removeEnvironmentFromProject('removal-test', 'default', types_1.SYSTEM_USER_AUDIT);
    overview = await stores.featureStrategiesStore.getFeatureOverview({
        projectId: 'default',
    });
    expect(overview.length).toBeGreaterThan(0);
    overview.forEach((o) => {
        expect(o.environments).toEqual([]);
    });
    const { events } = await eventService.getEvents();
    expect(events[0]).toMatchObject({
        type: 'project-environment-removed',
        project: 'default',
        environment: 'removal-test',
        createdBy: types_1.SYSTEM_USER.username,
        createdByUserId: types_1.SYSTEM_USER.id,
    });
});
test('Adding same environment twice should throw a NameExistsError', async () => {
    await db.stores.environmentStore.create({
        name: 'uniqueness-test',
        type: 'production',
    });
    await service.addEnvironmentToProject('uniqueness-test', 'default', types_1.SYSTEM_USER_AUDIT);
    await service.removeEnvironmentFromProject('test-connection', 'default', types_1.SYSTEM_USER_AUDIT);
    await service.removeEnvironmentFromProject('removal-test', 'default', types_1.SYSTEM_USER_AUDIT);
    return expect(async () => service.addEnvironmentToProject('uniqueness-test', 'default', types_1.SYSTEM_USER_AUDIT)).rejects.toThrow(new name_exists_error_1.default('default already has the environment uniqueness-test enabled'));
});
test('Removing environment not connected to project should be a noop', async () => expect(async () => service.removeEnvironmentFromProject('some-non-existing-environment', 'default', types_1.SYSTEM_USER_AUDIT)).resolves);
test('Trying to get an environment that does not exist throws NotFoundError', async () => {
    const envName = 'this-should-not-exist';
    await expect(async () => service.get(envName)).rejects.toThrow(new notfound_error_1.default(`Could not find environment with name: ${envName}`));
});
test('Setting an override disables all other envs', async () => {
    const enabledEnvName = 'should-get-enabled';
    const disabledEnvName = 'should-get-disabled';
    await db.stores.environmentStore.create({
        name: disabledEnvName,
        type: 'production',
    });
    await db.stores.environmentStore.create({
        name: enabledEnvName,
        type: 'production',
    });
    //Set these to the wrong state so we can assert that overriding them flips their state
    await service.toggleEnvironment(disabledEnvName, true);
    await service.toggleEnvironment(enabledEnvName, false);
    await service.overrideEnabledProjects([enabledEnvName]);
    const environments = await service.getAll();
    const targetedEnvironment = environments.find((env) => env.name === enabledEnvName);
    const allOtherEnvironments = environments
        .filter((x) => x.name !== enabledEnvName)
        .map((env) => env.enabled);
    expect(targetedEnvironment?.enabled).toBe(true);
    expect(allOtherEnvironments.every((x) => !x)).toBe(true);
});
test('Passing an empty override does nothing', async () => {
    const enabledEnvName = 'should-be-enabled';
    await db.stores.environmentStore.create({
        name: enabledEnvName,
        type: 'production',
    });
    await service.toggleEnvironment(enabledEnvName, true);
    await service.overrideEnabledProjects([]);
    const environments = await service.getAll();
    const targetedEnvironment = environments.find((env) => env.name === enabledEnvName);
    expect(targetedEnvironment?.enabled).toBe(true);
});
test('When given overrides should remap projects to override environments', async () => {
    const enabledEnvName = 'enabled';
    const ignoredEnvName = 'ignored';
    const disabledEnvName = 'disabled';
    const toggleName = 'test-toggle';
    await db.stores.environmentStore.create({
        name: enabledEnvName,
        type: 'production',
    });
    await db.stores.environmentStore.create({
        name: ignoredEnvName,
        type: 'production',
    });
    await db.stores.environmentStore.create({
        name: disabledEnvName,
        type: 'production',
    });
    await service.toggleEnvironment(disabledEnvName, true);
    await service.toggleEnvironment(ignoredEnvName, true);
    await service.toggleEnvironment(enabledEnvName, false);
    await stores.featureToggleStore.create('default', {
        name: toggleName,
        type: 'release',
        description: '',
        stale: false,
        createdByUserId: 9999,
    });
    await service.addEnvironmentToProject(disabledEnvName, 'default', types_1.SYSTEM_USER_AUDIT);
    await service.overrideEnabledProjects([enabledEnvName]);
    const projects = (await stores.projectStore.getEnvironmentsForProject('default')).map((e) => e.environment);
    expect(projects).toContain('enabled');
    expect(projects).not.toContain('default');
});
test('Override works correctly when enabling default and disabling prod and dev', async () => {
    const defaultEnvironment = 'default';
    const prodEnvironment = 'production';
    const devEnvironment = 'development';
    await db.stores.environmentStore.create({
        name: prodEnvironment,
        type: 'production',
    });
    await db.stores.environmentStore.create({
        name: devEnvironment,
        type: 'development',
    });
    await service.toggleEnvironment(prodEnvironment, true);
    await service.toggleEnvironment(devEnvironment, true);
    await service.overrideEnabledProjects([defaultEnvironment]);
    const environments = await service.getAll();
    const targetedEnvironment = environments.find((env) => env.name === defaultEnvironment);
    const allOtherEnvironments = environments
        .filter((x) => x.name !== defaultEnvironment)
        .map((env) => env.enabled);
    const envNames = environments.map((x) => x.name);
    expect(envNames).toContain('production');
    expect(envNames).toContain('development');
    expect(targetedEnvironment?.enabled).toBe(true);
    expect(allOtherEnvironments.every((x) => !x)).toBe(true);
});
test('getProjectEnvironments also includes whether or not a given project is visible on a given environment', async () => {
    const assertContains = (environments, envName, visible) => {
        const env = environments.find((e) => e.name === envName);
        expect(env).toBeDefined();
        expect(env.visible).toBe(visible);
    };
    const assertContainsVisible = (environments, envName) => {
        assertContains(environments, envName, true);
    };
    const assertContainsNotVisible = (environments, envName) => {
        assertContains(environments, envName, false);
    };
    const projectId = 'default';
    const firstEnvTest = 'some-connected-environment';
    const secondEnvTest = 'some-also-connected-environment';
    await db.stores.environmentStore.create({
        name: firstEnvTest,
        type: 'production',
    });
    await db.stores.environmentStore.create({
        name: secondEnvTest,
        type: 'production',
    });
    await service.addEnvironmentToProject(firstEnvTest, projectId, types_1.SYSTEM_USER_AUDIT);
    await service.addEnvironmentToProject(secondEnvTest, projectId, types_1.SYSTEM_USER_AUDIT);
    let environments = await service.getProjectEnvironments(projectId);
    assertContainsVisible(environments, firstEnvTest);
    assertContainsVisible(environments, secondEnvTest);
    await service.removeEnvironmentFromProject(firstEnvTest, projectId, types_1.SYSTEM_USER_AUDIT);
    environments = await service.getProjectEnvironments(projectId);
    assertContainsNotVisible(environments, firstEnvTest);
    assertContainsVisible(environments, secondEnvTest);
});
//# sourceMappingURL=environment-service.test.js.map