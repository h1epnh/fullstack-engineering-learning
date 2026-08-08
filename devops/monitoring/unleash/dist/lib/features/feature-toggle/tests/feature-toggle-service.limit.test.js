"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createFeatureToggleService_1 = require("../createFeatureToggleService");
const no_logger_1 = __importDefault(require("../../../../test/fixtures/no-logger"));
const exceeds_limit_error_1 = require("../../../error/exceeds-limit-error");
const alwaysOnFlagResolver = {
    isEnabled() {
        return true;
    },
};
describe('Strategy limits', () => {
    test('Should not allow to exceed strategy limit', async () => {
        const LIMIT = 3;
        const { featureToggleService, featureToggleStore } = (0, createFeatureToggleService_1.createFakeFeatureToggleService)({
            getLogger: no_logger_1.default,
            flagResolver: alwaysOnFlagResolver,
            resourceLimits: {
                featureEnvironmentStrategies: LIMIT,
            },
        });
        const addStrategy = () => featureToggleService.unprotectedCreateStrategy({ name: 'default', featureName: 'feature' }, { projectId: 'default', featureName: 'feature' }, {});
        await featureToggleStore.create('default', {
            name: 'feature',
            createdByUserId: 1,
        });
        for (let i = 0; i < LIMIT; i++) {
            await addStrategy();
        }
        await expect(addStrategy()).rejects.toThrow("Failed to create strategy. You can't create more than the established limit of 3");
    });
    test('Should not allow to exceed constraints limit', async () => {
        const LIMIT = 1;
        const { featureToggleService, featureToggleStore } = (0, createFeatureToggleService_1.createFakeFeatureToggleService)({
            getLogger: no_logger_1.default,
            flagResolver: alwaysOnFlagResolver,
            resourceLimits: {
                constraints: LIMIT,
            },
        });
        const addStrategy = (constraints) => featureToggleService.unprotectedCreateStrategy({
            name: 'default',
            featureName: 'feature',
            constraints: constraints,
        }, { projectId: 'default', featureName: 'feature' }, {});
        await featureToggleStore.create('default', {
            name: 'feature',
            createdByUserId: 1,
        });
        await expect(addStrategy([
            {
                values: ['1'],
                operator: 'IN',
                contextName: 'accountId',
            },
            {
                values: ['2'],
                operator: 'IN',
                contextName: 'accountId',
            },
        ])).rejects.toThrow("Failed to create constraints. You can't create more than the established limit of 1");
    });
    test('Should not throw limit exceeded errors if the new number of constraints is less than or equal to the previous number', async () => {
        const LIMIT = 1;
        const { featureToggleService, featureStrategiesStore } = (0, createFeatureToggleService_1.createFakeFeatureToggleService)({
            getLogger: no_logger_1.default,
            flagResolver: alwaysOnFlagResolver,
            resourceLimits: {
                constraints: LIMIT,
            },
        });
        const constraints = [
            {
                values: ['1'],
                operator: 'IN',
                contextName: 'appName',
            },
            {
                values: ['2'],
                operator: 'IN',
                contextName: 'appName',
            },
            {
                values: ['3'],
                operator: 'IN',
                contextName: 'appName',
            },
        ];
        const flagName = 'feature';
        await featureStrategiesStore.createFeature({
            name: flagName,
            createdByUserId: 1,
        });
        const strategy = await featureStrategiesStore.createStrategyFeatureEnv({
            parameters: {},
            strategyName: 'default',
            featureName: flagName,
            constraints: constraints,
            projectId: 'default',
            environment: 'default',
        });
        const updateStrategy = (newConstraints) => featureToggleService.unprotectedUpdateStrategy(strategy.id, {
            constraints: newConstraints,
        }, {
            projectId: 'default',
            featureName: 'feature',
            environment: 'default',
        }, {});
        // check that you can save the same amount of constraints
        await updateStrategy(constraints);
        // check that you can save fewer constraints but still over the limit
        await updateStrategy(constraints.slice(0, 2));
        // check that you can't save more constraints
        await expect(async () => updateStrategy([...constraints, ...constraints])).rejects.toThrow(new exceeds_limit_error_1.ExceedsLimitError('constraints', LIMIT));
    });
    test('Should not allow to exceed constraint values limit', async () => {
        const LIMIT = 3;
        const { featureToggleService, featureToggleStore } = (0, createFeatureToggleService_1.createFakeFeatureToggleService)({
            getLogger: no_logger_1.default,
            flagResolver: alwaysOnFlagResolver,
            resourceLimits: {
                constraintValues: LIMIT,
            },
        });
        const addStrategyWithConstraints = (constraints) => featureToggleService.unprotectedCreateStrategy({
            name: 'default',
            featureName: 'feature',
            constraints,
        }, { projectId: 'default', featureName: 'feature' }, {});
        await featureToggleStore.create('default', {
            name: 'feature',
            createdByUserId: 1,
        });
        await expect(() => addStrategyWithConstraints([
            {
                contextName: 'userId',
                operator: 'IN',
                values: ['1', '2', '3', '4'],
            },
        ])).rejects.toThrow("Failed to create constraint values for userId. You can't create more than the established limit of 3");
    });
    test('Should not throw limit exceeded errors for constraint values if the new values are less than or equal to the old values AND there have been no other constraint updates (re-ordering or deleting)', async () => {
        const LIMIT = 1;
        const { featureToggleService, featureStrategiesStore } = (0, createFeatureToggleService_1.createFakeFeatureToggleService)({
            getLogger: no_logger_1.default,
            flagResolver: alwaysOnFlagResolver,
            resourceLimits: {
                constraintValues: LIMIT,
            },
        });
        const constraints = (valueCount) => [
            {
                values: Array.from({ length: valueCount }).map((_, i) => i.toString()),
                operator: 'IN',
                contextName: 'appName',
            },
            {
                values: ['a', 'b', 'c'],
                operator: 'IN',
                contextName: 'appName',
            },
        ];
        const flagName = 'feature';
        await featureStrategiesStore.createFeature({
            name: flagName,
            createdByUserId: 1,
        });
        const initialConstraintValueCount = LIMIT + 2;
        const strategy = await featureStrategiesStore.createStrategyFeatureEnv({
            parameters: {},
            strategyName: 'default',
            featureName: flagName,
            constraints: constraints(initialConstraintValueCount),
            projectId: 'default',
            environment: 'default',
        });
        const updateStrategy = (valueCount) => featureToggleService.unprotectedUpdateStrategy(strategy.id, {
            constraints: constraints(valueCount),
        }, {
            projectId: 'default',
            featureName: 'feature',
            environment: 'default',
        }, {});
        // check that you can save the same amount of constraint values
        await updateStrategy(initialConstraintValueCount);
        // check that you can save fewer constraint values but still over the limit
        await updateStrategy(initialConstraintValueCount - 1);
        // check that you can't save more constraint values
        await expect(async () => updateStrategy(initialConstraintValueCount + 1)).rejects.toThrow(new exceeds_limit_error_1.ExceedsLimitError('constraint values for appName', LIMIT));
    });
});
describe('Flag limits', () => {
    test('Should not allow you to exceed the flag limit', async () => {
        const LIMIT = 3;
        const { featureToggleService, projectStore } = (0, createFeatureToggleService_1.createFakeFeatureToggleService)({
            getLogger: no_logger_1.default,
            flagResolver: alwaysOnFlagResolver,
            resourceLimits: {
                featureFlags: LIMIT,
            },
        });
        await projectStore.create({
            name: 'default',
            description: 'default',
            id: 'default',
        });
        const createFlag = (name) => featureToggleService.createFeatureToggle('default', { name }, {});
        for (let i = 0; i < LIMIT; i++) {
            await createFlag(`feature-${i}`);
        }
        await expect(createFlag('excessive')).rejects.toThrow("Failed to create feature flag. You can't create more than the established limit of 3");
    });
    test('Archived flags do not count towards the total', async () => {
        const LIMIT = 1;
        const { featureToggleService, projectStore } = (0, createFeatureToggleService_1.createFakeFeatureToggleService)({
            getLogger: no_logger_1.default,
            flagResolver: alwaysOnFlagResolver,
            resourceLimits: {
                featureFlags: LIMIT,
            },
        });
        await projectStore.create({
            name: 'default',
            description: 'default',
            id: 'default',
        });
        const createFlag = (name) => featureToggleService.createFeatureToggle('default', { name }, {});
        await createFlag('to-be-archived');
        await featureToggleService.archiveToggle('to-be-archived', {}, {});
        await expect(createFlag('should-be-okay')).resolves.toMatchObject({
            name: 'should-be-okay',
        });
    });
});
//# sourceMappingURL=feature-toggle-service.limit.test.js.map