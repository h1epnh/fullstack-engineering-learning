"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_config_1 = require("../../../../test/config/test-config");
const database_init_1 = __importDefault(require("../../../../test/e2e/helpers/database-init"));
const util_1 = require("../../../util");
const types_1 = require("../../../types");
const environment_service_1 = __importDefault(require("../../project-environments/environment-service"));
const error_1 = require("../../../error");
const __1 = require("../..");
const test_helper_1 = require("../../../../test/e2e/helpers/test-helper");
let stores;
let db;
let service;
let segmentService;
let eventService;
let environmentService;
let unleashConfig;
const mockConstraints = () => {
    return Array.from({ length: 5 }).map(() => ({
        values: ['x', 'y', 'z'],
        operator: 'IN',
        contextName: 'a',
    }));
};
const irrelevantDate = new Date();
beforeAll(async () => {
    const config = (0, test_config_1.createTestConfig)({
        experimental: { flags: {} },
    });
    db = await (0, database_init_1.default)('feature_toggle_service_v2_service_serial', config.getLogger, { dbInitMethod: 'legacy' });
    unleashConfig = config;
    stores = db.stores;
    segmentService = (0, __1.createSegmentService)(db.rawDatabase, config);
    service = (0, __1.createFeatureToggleService)(db.rawDatabase, config);
    eventService = (0, __1.createEventsService)(db.rawDatabase, config);
});
afterAll(async () => {
    await db.rawDatabase('change_request_settings').del();
    await db.destroy();
});
beforeEach(async () => {
    await db.rawDatabase('change_request_settings').del();
});
test('Should create feature flag strategy configuration', async () => {
    const projectId = 'default';
    const config = {
        name: 'default',
        constraints: [],
        parameters: {},
    };
    await service.createFeatureToggle('default', {
        name: 'Demo',
    }, types_1.TEST_AUDIT_USER);
    const createdConfig = await service.createStrategy(config, { projectId, featureName: 'Demo', environment: util_1.DEFAULT_ENV }, types_1.TEST_AUDIT_USER);
    expect(createdConfig.name).toEqual('default');
    expect(createdConfig.id).toBeDefined();
});
test('Should be able to update existing strategy configuration', async () => {
    const projectId = 'default';
    const featureName = 'update-existing-strategy';
    const config = {
        name: 'default',
        constraints: [],
        parameters: {},
    };
    await service.createFeatureToggle(projectId, {
        name: featureName,
    }, types_1.TEST_AUDIT_USER);
    const createdConfig = await service.createStrategy(config, { projectId, featureName, environment: util_1.DEFAULT_ENV }, types_1.TEST_AUDIT_USER);
    expect(createdConfig.name).toEqual('default');
    const updatedConfig = await service.updateStrategy(createdConfig.id, { parameters: { b2b: 'true' } }, { projectId, featureName, environment: util_1.DEFAULT_ENV }, types_1.TEST_AUDIT_USER);
    expect(createdConfig.id).toEqual(updatedConfig.id);
    expect(updatedConfig.parameters).toEqual({ b2b: 'true' });
});
test('Should be able to get strategy by id', async () => {
    const featureName = 'get-strategy-by-id';
    const projectId = 'default';
    const config = {
        name: 'default',
        constraints: [],
        variants: [],
        parameters: {},
        title: 'some-title',
    };
    await service.createFeatureToggle(projectId, {
        name: featureName,
    }, types_1.TEST_AUDIT_USER);
    const createdConfig = await service.createStrategy(config, { projectId, featureName, environment: util_1.DEFAULT_ENV }, types_1.TEST_AUDIT_USER);
    const fetchedConfig = await service.getStrategy(createdConfig.id);
    expect(fetchedConfig).toEqual(createdConfig);
});
test('should ignore name in the body when updating feature flag', async () => {
    const featureName = 'body-name-update';
    const projectId = 'default';
    const secondFeatureName = 'body-name-update2';
    await service.createFeatureToggle(projectId, {
        name: featureName,
        description: 'First flag',
    }, types_1.TEST_AUDIT_USER);
    await service.createFeatureToggle(projectId, {
        name: secondFeatureName,
        description: 'Second flag',
    }, types_1.TEST_AUDIT_USER);
    const update = {
        name: secondFeatureName,
        description: "I'm changed",
    };
    await service.updateFeatureToggle(projectId, update, featureName, types_1.TEST_AUDIT_USER);
    const featureOne = await service.getFeature({ featureName });
    const featureTwo = await service.getFeature({
        featureName: secondFeatureName,
    });
    expect(featureOne.description).toBe(`I'm changed`);
    expect(featureTwo.description).toBe('Second flag');
});
test('should not get empty rows as features', async () => {
    const projectId = 'default';
    await service.createFeatureToggle(projectId, {
        name: 'linked-with-segment',
        description: 'First flag',
    }, types_1.TEST_AUDIT_USER);
    await service.createFeatureToggle(projectId, {
        name: 'not-linked-with-segment',
        description: 'Second flag',
    }, types_1.TEST_AUDIT_USER);
    const user = { email: 'test@example.com' };
    const postData = {
        name: 'Unlinked segment',
        constraints: mockConstraints(),
    };
    await segmentService.create(postData, (0, util_1.extractAuditInfoFromUser)(user));
    const features = await service.getClientFeatures();
    const namelessFeature = features.find((p) => !p.name);
    expect(features.length).toBe(7);
    expect(namelessFeature).toBeUndefined();
});
test('adding and removing an environment preserves variants when variants per env is off', async () => {
    const featureName = 'something-that-has-variants';
    const prodEnv = 'mock-prod-env';
    await stores.environmentStore.create({
        name: prodEnv,
        type: 'production',
    });
    await service.createFeatureToggle('default', {
        name: featureName,
        description: 'Second flag',
        variants: [
            {
                name: 'variant1',
                weight: 100,
                weightType: 'fix',
                stickiness: 'default',
            },
        ],
    }, types_1.TEST_AUDIT_USER);
    //force the variantEnvironments flag off so that we can test legacy behavior
    environmentService = new environment_service_1.default(stores, {
        ...unleashConfig,
        // @ts-expect-error - incomplete flag resolver definition
        flagResolver: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            isEnabled: (flagName) => false,
        },
    }, eventService);
    await environmentService.addEnvironmentToProject(prodEnv, 'default', types_1.SYSTEM_USER_AUDIT);
    await environmentService.removeEnvironmentFromProject(prodEnv, 'default', types_1.SYSTEM_USER_AUDIT);
    await environmentService.addEnvironmentToProject(prodEnv, 'default', types_1.SYSTEM_USER_AUDIT);
    const flag = await service.getFeature({
        featureName,
        projectId: undefined,
        environmentVariants: false,
    });
    expect(flag.variants).toHaveLength(1);
});
test('cloning a feature flag copies variant environments correctly', async () => {
    const newFlagName = 'Molly';
    const clonedFlagName = 'Dolly';
    const targetEnv = 'gene-lab';
    await service.createFeatureToggle('default', {
        name: newFlagName,
    }, types_1.TEST_AUDIT_USER);
    await stores.environmentStore.create({
        name: 'gene-lab',
        type: 'production',
    });
    await stores.featureEnvironmentStore.connectFeatureToEnvironmentsForProject(newFlagName, 'default');
    await stores.featureEnvironmentStore.addVariantsToFeatureEnvironment(newFlagName, targetEnv, [
        {
            name: 'variant1',
            weight: 100,
            weightType: 'fix',
            stickiness: 'default',
        },
    ]);
    await service.cloneFeatureToggle(newFlagName, 'default', clonedFlagName, types_1.SYSTEM_USER_AUDIT, true);
    const clonedFlag = await stores.featureStrategiesStore.getFeatureToggleWithVariantEnvs(clonedFlagName);
    const defaultEnv = clonedFlag.environments.find((x) => x.name === 'default');
    const newEnv = clonedFlag.environments.find((x) => x.name === targetEnv);
    expect(defaultEnv.variants).toHaveLength(0);
    expect(newEnv.variants).toHaveLength(1);
});
test('cloning a feature flag not allowed for change requests enabled', async () => {
    await db.rawDatabase('change_request_settings').insert({
        project: 'default',
        environment: 'default',
    });
    await expect(service.cloneFeatureToggle('newFlagName', 'default', 'clonedFlagName', types_1.SYSTEM_USER_AUDIT, true)).rejects.toEqual(new error_1.ForbiddenError(`Cloning not allowed. Project default has change requests enabled.`));
});
test('changing to a project with change requests enabled should not be allowed', async () => {
    await db.rawDatabase('change_request_settings').insert({
        project: 'default',
        environment: 'default',
    });
    await expect(service.changeProject('newFlagName', 'default', types_1.TEST_AUDIT_USER)).rejects.toEqual(new error_1.ForbiddenError(`Changing project not allowed. Project default has change requests enabled.`));
});
test('Cloning a feature flag also clones segments correctly', async () => {
    const featureName = 'FlagWithSegments';
    const clonedFeatureName = 'AWholeNewFeatureFlag';
    const segment = await segmentService.create({
        name: 'SomeSegment',
        constraints: mockConstraints(),
    }, types_1.TEST_AUDIT_USER);
    await service.createFeatureToggle('default', {
        name: featureName,
    }, types_1.TEST_AUDIT_USER);
    const config = {
        name: 'default',
        constraints: [],
        parameters: {},
        segments: [segment.id],
    };
    await service.createStrategy(config, { projectId: 'default', featureName, environment: util_1.DEFAULT_ENV }, types_1.TEST_AUDIT_USER);
    await service.cloneFeatureToggle(featureName, 'default', clonedFeatureName, types_1.TEST_AUDIT_USER, true);
    const feature = await service.getFeature({
        featureName: clonedFeatureName,
    });
    expect(feature.environments.find((x) => x.name === 'default')?.strategies[0]
        .segments).toHaveLength(1);
});
test('Should not convert null title to empty string', async () => {
    const featureName = 'FeatureNoTitle';
    await service.createFeatureToggle('default', {
        name: featureName,
    }, types_1.TEST_AUDIT_USER);
    const config = {
        name: 'default',
        constraints: [],
        parameters: {},
    };
    await service.createStrategy(config, { projectId: 'default', featureName, environment: util_1.DEFAULT_ENV }, types_1.TEST_AUDIT_USER);
    const feature = await service.getFeature({
        featureName: featureName,
    });
    expect(feature.environments[0].strategies[0].title).toBe(null);
});
test('If change requests are enabled, cannot change variants without going via CR', async () => {
    const featureName = 'feature-with-variants-per-env-and-cr';
    await service.createFeatureToggle('default', { name: featureName }, types_1.TEST_AUDIT_USER);
    // Force all feature flags on to make sure we have Change requests on
    const customFeatureService = (0, __1.createFeatureToggleService)(db.rawDatabase, {
        ...unleashConfig,
        // @ts-expect-error - incomplete flag resolver definition
        flagResolver: {
            isEnabled: () => true,
        },
    });
    const newVariant = {
        name: 'cr-enabled',
        weight: 100,
        weightType: 'variable',
        stickiness: 'default',
    };
    await db.rawDatabase('change_request_settings').insert({
        project: 'default',
        environment: 'default',
    });
    return expect(async () => customFeatureService.crProtectedSaveVariantsOnEnv('default', featureName, 'default', [newVariant], {
        createdAt: irrelevantDate,
        email: '',
        id: 0,
        imageUrl: '',
        loginAttempts: 0,
        name: '',
        permissions: [],
        seenAt: irrelevantDate,
        username: '',
        isAPI: true,
    }, types_1.TEST_AUDIT_USER, [])).rejects.toThrowError(new error_1.PermissionError(types_1.SKIP_CHANGE_REQUEST));
});
test('If CRs are protected for any environment in the project stops bulk update of variants', async () => {
    const project = await stores.projectStore.create({
        id: 'crOnVariantsProject',
        name: 'crOnVariantsProject',
    });
    const enabledEnv = await stores.environmentStore.create({
        name: 'crenabledenv',
        type: 'production',
    });
    const disabledEnv = await stores.environmentStore.create({
        name: 'crdisabledenv',
        type: 'production',
    });
    await stores.projectStore.addEnvironmentToProject(project.id, enabledEnv.name);
    await stores.projectStore.addEnvironmentToProject(project.id, disabledEnv.name);
    // Force all feature flags on to make sure we have Change requests on
    const customFeatureService = (0, __1.createFeatureToggleService)(db.rawDatabase, {
        ...unleashConfig,
        // @ts-expect-error - incomplete flag resolver definition
        flagResolver: {
            isEnabled: () => true,
        },
    });
    const flag = await service.createFeatureToggle(project.id, { name: 'crOnVariantFlag' }, types_1.TEST_AUDIT_USER);
    const variant = {
        name: 'cr-enabled',
        weight: 100,
        weightType: 'variable',
        stickiness: 'default',
    };
    await db.rawDatabase('change_request_settings').insert({
        project: project.id,
        environment: enabledEnv.name,
    });
    await customFeatureService.setVariantsOnEnvs(project.id, flag.name, [enabledEnv.name, disabledEnv.name], [variant], types_1.TEST_AUDIT_USER);
    const newVariants = [
        { ...variant, weight: 500 },
        {
            name: 'cr-enabled-2',
            weight: 500,
            weightType: 'fix',
            stickiness: 'default',
        },
    ];
    return expect(async () => customFeatureService.crProtectedSetVariantsOnEnvs(project.id, flag.name, [enabledEnv.name, disabledEnv.name], newVariants, {
        createdAt: irrelevantDate,
        email: '',
        id: 0,
        imageUrl: '',
        loginAttempts: 0,
        name: '',
        permissions: [],
        seenAt: irrelevantDate,
        username: '',
        isAPI: true,
    }, types_1.TEST_AUDIT_USER)).rejects.toThrowError(new error_1.PermissionError(types_1.SKIP_CHANGE_REQUEST));
});
test('getPlaygroundFeatures should return ids and titles (if they exist) on client strategies', async () => {
    const featureName = 'check-returned-strategy-configuration';
    const projectId = 'default';
    const title = 'custom strategy title';
    const config = {
        name: 'default',
        constraints: [],
        parameters: {},
        title,
    };
    await service.createFeatureToggle(projectId, {
        name: featureName,
    }, types_1.TEST_AUDIT_USER);
    await service.createStrategy(config, { projectId, featureName, environment: util_1.DEFAULT_ENV }, types_1.TEST_AUDIT_USER);
    const playgroundFeatures = await service.getPlaygroundFeatures();
    const strategyWithTitle = playgroundFeatures.find((feature) => feature.name === featureName).strategies[0];
    expect(strategyWithTitle.title).toStrictEqual(title);
    for (const strategy of playgroundFeatures.flatMap((feature) => feature.strategies)) {
        expect(strategy.id).not.toBeUndefined();
    }
});
describe('flag name validation', () => {
    test('should validate feature names if the project has flag name pattern', async () => {
        const projectId = 'pattern-validation';
        const featureNaming = {
            pattern: 'testpattern.+',
            example: 'testpattern-one!',
            description: 'naming description',
        };
        const project = {
            id: projectId,
            name: projectId,
            mode: 'open',
            defaultStickiness: 'default',
        };
        await stores.projectStore.create(project);
        await stores.projectStore.updateProjectEnterpriseSettings({
            id: projectId,
            featureNaming,
        });
        const validFeatures = ['testpattern-feature', 'testpattern-feature2'];
        const invalidFeatures = ['a', 'b', 'c'];
        for (const feature of invalidFeatures) {
            await expect(service.validateFeatureFlagNameAgainstPattern(feature, projectId)).rejects.toBeInstanceOf(error_1.PatternError);
        }
        for (const feature of validFeatures) {
            await expect(service.validateFeatureFlagNameAgainstPattern(feature, projectId)).resolves.toBeFalsy();
        }
    });
    test("should allow anything if the project doesn't exist", async () => {
        const projectId = 'project-that-doesnt-exist';
        const validFeatures = ['testpattern-feature', 'testpattern-feature2'];
        for (const feature of validFeatures) {
            await expect(service.validateFeatureFlagNameAgainstPattern(feature, projectId)).resolves.toBeFalsy();
        }
    });
});
test('Should return last seen at per environment', async () => {
    const featureName = 'last-seen-at-per-env';
    const projectId = 'default';
    await service.createFeatureToggle(projectId, {
        name: featureName,
    }, types_1.TEST_AUDIT_USER);
    // Test with feature flag on
    const config = (0, test_config_1.createTestConfig)();
    const featureService = (0, __1.createFeatureToggleService)(db.rawDatabase, config);
    const lastSeenAtStoreDate = await (0, test_helper_1.insertLastSeenAt)(featureName, db.rawDatabase);
    const featureToggle = await featureService.getFeature({
        featureName,
        projectId: 'default',
        environmentVariants: false,
    });
    expect(featureToggle.environments[0].lastSeenAt).toEqual(new Date(lastSeenAtStoreDate));
    expect(featureToggle.lastSeenAt).toEqual(new Date(lastSeenAtStoreDate));
});
test('Should return "default" for stickiness when creating a flexibleRollout strategy with empty stickiness', async () => {
    const strategy = {
        name: 'flexibleRollout',
        parameters: {
            rollout: '100',
            stickiness: '',
        },
        constraints: [],
    };
    const feature = {
        name: 'test-feature-stickiness-1',
        description: 'the #1 feature',
    };
    const projectId = 'default';
    await service.createFeatureToggle(projectId, feature, types_1.TEST_AUDIT_USER);
    await service.createStrategy(strategy, { projectId, featureName: feature.name, environment: util_1.DEFAULT_ENV }, types_1.TEST_AUDIT_USER);
    const featureDB = await service.getFeature({ featureName: feature.name });
    expect(featureDB.environments[0]).toMatchObject({
        strategies: [{ parameters: { stickiness: 'default' } }],
    });
});
test('Should not allow to add flags to archived projects', async () => {
    const project = await stores.projectStore.create({
        id: 'archivedProject',
        name: 'archivedProject',
    });
    await stores.projectStore.archive(project.id);
    await expect(service.createFeatureToggle(project.id, {
        name: 'irrelevant',
    }, types_1.TEST_AUDIT_USER)).rejects.toEqual(new error_1.NotFoundError(`Active project with id archivedProject does not exist`));
});
test('Should not allow to revive flags to archived projects', async () => {
    const project = await stores.projectStore.create({
        id: 'archivedProjectWithFlag',
        name: 'archivedProjectWithFlag',
    });
    const flag = await service.createFeatureToggle(project.id, {
        name: 'archiveFlag',
    }, types_1.TEST_AUDIT_USER);
    await service.archiveToggle(flag.name, { email: 'test@example.com' }, types_1.TEST_AUDIT_USER);
    await stores.projectStore.archive(project.id);
    await expect(service.reviveFeature(flag.name, types_1.TEST_AUDIT_USER)).rejects.toEqual(new error_1.NotFoundError(`Active project with id archivedProjectWithFlag does not exist`));
    await expect(service.reviveFeatures([flag.name], project.id, types_1.TEST_AUDIT_USER)).rejects.toEqual(new error_1.NotFoundError(`Active project with id archivedProjectWithFlag does not exist`));
});
test('Should enable disabled strategies on feature environment enabled', async () => {
    const flagName = 'enableThisFlag';
    const project = 'default';
    const environment = 'default';
    await service.createFeatureToggle(project, {
        name: flagName,
    }, types_1.TEST_AUDIT_USER);
    const config = {
        name: 'default',
        constraints: [
            { contextName: 'userId', operator: 'IN', values: ['1', '1'] },
        ],
        parameters: { param: 'a' },
        variants: [
            {
                name: 'a',
                weight: 100,
                weightType: 'variable',
                stickiness: 'random',
            },
        ],
        disabled: true,
    };
    const createdConfig = await service.createStrategy(config, { projectId: project, featureName: flagName, environment }, types_1.TEST_AUDIT_USER);
    await service.updateEnabled(project, flagName, environment, true, types_1.TEST_AUDIT_USER, { email: 'test@example.com' }, true);
    const strategy = await service.getStrategy(createdConfig.id);
    expect(strategy).toMatchObject({ ...config, disabled: false });
});
//# sourceMappingURL=feature-toggle-service.e2e.test.js.map