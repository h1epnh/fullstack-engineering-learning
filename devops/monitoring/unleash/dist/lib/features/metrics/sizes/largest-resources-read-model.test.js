"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../../../test/e2e/helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../../test/fixtures/no-logger"));
let db;
let largestResourcesReadModel;
let featureToggleStore;
let featureStrategiesStore;
beforeAll(async () => {
    db = await (0, database_init_1.default)('largest_resources_read_model', no_logger_1.default);
    featureToggleStore = db.stores.featureToggleStore;
    featureStrategiesStore = db.stores.featureStrategiesStore;
    largestResourcesReadModel = db.stores.largestResourcesReadModel;
});
afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});
beforeEach(async () => {
    await featureToggleStore.deleteAll();
});
const createFeature = async (config) => {
    await featureToggleStore.create('default', {
        name: config.featureName,
        createdByUserId: 9999,
    });
    await featureStrategiesStore.createStrategyFeatureEnv({
        strategyName: 'flexibleRollout',
        projectId: 'default',
        environment: 'default',
        featureName: config.featureName,
        constraints: config.constraints,
        parameters: config.parameters,
        variants: config.variants,
    });
};
test('can calculate resource size', async () => {
    await createFeature({
        featureName: 'featureA',
        parameters: {
            groupId: 'flag_init_test_1',
            rollout: '25',
            stickiness: 'default',
        },
        constraints: [
            {
                contextName: 'clientId',
                operator: 'IN',
                values: ['1', '2', '3', '4', '5', '6'],
                caseInsensitive: false,
                inverted: false,
            },
        ],
        variants: [
            {
                name: 'a',
                weight: 1000,
                weightType: 'fix',
                stickiness: 'default',
            },
        ],
    });
    await createFeature({
        featureName: 'featureB',
        parameters: {},
        constraints: [],
        variants: [],
    });
    const [project] = await largestResourcesReadModel.getLargestProjectEnvironments(1);
    const [feature1, feature2] = await largestResourcesReadModel.getLargestFeatureEnvironments(2);
    expect(project.size).toBeGreaterThan(400);
    expect(project.size).toBe(feature1.size + feature2.size);
    expect(feature1.size).toBeGreaterThan(feature2.size);
});
//# sourceMappingURL=largest-resources-read-model.test.js.map