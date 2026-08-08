"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../test/e2e/helpers/database-init"));
const no_logger_1 = __importDefault(require("../../test/fixtures/no-logger"));
let db;
beforeAll(async () => {
    db = await (0, database_init_1.default)('feature_strategy_store_serial', no_logger_1.default);
    no_logger_1.default.setMuteError(true);
});
afterAll(async () => {
    if (db) {
        await db.destroy();
    }
    no_logger_1.default.setMuteError(false);
});
test('returns 0 if no custom strategies', async () => {
    // Arrange
    const featureStrategiesStore = db.stores.featureStrategiesStore;
    // Act
    const inUseCount = await featureStrategiesStore.getCustomStrategiesInUseCount();
    // Assert
    expect(inUseCount).toEqual(0);
});
test('returns 0 if no custom strategies are in use', async () => {
    // Arrange
    const featureToggleStore = db.stores.featureToggleStore;
    const featureStrategiesStore = db.stores.featureStrategiesStore;
    const strategyStore = db.stores.strategyStore;
    await featureToggleStore.create('default', {
        name: 'test-toggle-2',
        createdByUserId: 9999,
    });
    await strategyStore.createStrategy({
        name: 'strategy-2',
        parameters: [],
        description: '',
    });
    // Act
    const inUseCount = await featureStrategiesStore.getCustomStrategiesInUseCount();
    // Assert
    expect(inUseCount).toEqual(0);
});
test('counts custom strategies in use', async () => {
    // Arrange
    const featureToggleStore = db.stores.featureToggleStore;
    const featureStrategiesStore = db.stores.featureStrategiesStore;
    const strategyStore = db.stores.strategyStore;
    await featureToggleStore.create('default', {
        name: 'test-toggle',
        createdByUserId: 9999,
    });
    await strategyStore.createStrategy({
        name: 'strategy-1',
        parameters: [],
        description: '',
    });
    await featureStrategiesStore.createStrategyFeatureEnv({
        projectId: 'default',
        featureName: 'test-toggle',
        strategyName: 'strategy-1',
        environment: 'default',
        parameters: {},
        constraints: [],
        variants: [],
    });
    // Act
    const inUseCount = await featureStrategiesStore.getCustomStrategiesInUseCount();
    // Assert
    expect(inUseCount).toEqual(1);
});
const baseStrategy = {
    projectId: 'default',
    featureName: 'test-toggle-increment',
    strategyName: 'strategy-1',
    environment: 'default',
    parameters: {},
    constraints: [],
    variants: [],
};
test('increment sort order on each new insert', async () => {
    const featureToggleStore = db.stores.featureToggleStore;
    const featureStrategiesStore = db.stores.featureStrategiesStore;
    await featureToggleStore.create('default', {
        name: 'test-toggle-increment',
        createdByUserId: 9999,
    });
    const { id: firstId } = await featureStrategiesStore.createStrategyFeatureEnv({
        ...baseStrategy,
        featureName: 'test-toggle-increment',
        strategyName: 'strategy-1',
        // sort order implicitly 0
    });
    const { id: secondId } = await featureStrategiesStore.createStrategyFeatureEnv({
        ...baseStrategy,
        featureName: 'test-toggle-increment',
        strategyName: 'strategy-2',
        sortOrder: 50, // explicit sort order
    });
    const { id: thirdId } = await featureStrategiesStore.createStrategyFeatureEnv({
        ...baseStrategy,
        featureName: 'test-toggle-increment',
        strategyName: 'strategy-2',
        // implicit sort order incremented by 1
    });
    const firstStrategy = await featureStrategiesStore.getStrategyById(firstId);
    const secondStrategy = await featureStrategiesStore.getStrategyById(secondId);
    const thirdStrategy = await featureStrategiesStore.getStrategyById(thirdId);
    expect(firstStrategy.sortOrder).toEqual(0);
    expect(secondStrategy.sortOrder).toEqual(50);
    expect(thirdStrategy.sortOrder).toEqual(51);
});
//# sourceMappingURL=feature-strategy-store.test.js.map