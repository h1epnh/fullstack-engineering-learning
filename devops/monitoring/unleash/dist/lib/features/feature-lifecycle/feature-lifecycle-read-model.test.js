"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../../test/e2e/helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../test/fixtures/no-logger"));
const feature_lifecycle_read_model_1 = require("./feature-lifecycle-read-model");
let db;
let featureLifecycleReadModel;
let featureLifecycleStore;
let featureToggleStore;
const alwaysOnFlagResolver = {
    isEnabled() {
        return true;
    },
};
beforeAll(async () => {
    db = await (0, database_init_1.default)('feature_lifecycle_read_model', no_logger_1.default);
    featureLifecycleReadModel = new feature_lifecycle_read_model_1.FeatureLifecycleReadModel(db.rawDatabase, alwaysOnFlagResolver);
    featureLifecycleStore = db.stores.featureLifecycleStore;
    featureToggleStore = db.stores.featureToggleStore;
});
afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});
beforeEach(async () => {
    await featureToggleStore.deleteAll();
});
test('can return stage count', async () => {
    await featureToggleStore.create('default', {
        name: 'featureA',
        createdByUserId: 9999,
    });
    await featureToggleStore.create('default', {
        name: 'featureB',
        createdByUserId: 9999,
    });
    await featureToggleStore.create('default', {
        name: 'featureC',
        createdByUserId: 9999,
    });
    await featureLifecycleStore.insert([
        { feature: 'featureA', stage: 'initial' },
        { feature: 'featureB', stage: 'initial' },
        { feature: 'featureC', stage: 'initial' },
    ]);
    await featureLifecycleStore.insert([
        { feature: 'featureA', stage: 'pre-live' },
    ]);
    const stageCount = await featureLifecycleReadModel.getStageCount();
    expect(stageCount).toMatchObject([
        { stage: 'pre-live', count: 1 },
        { stage: 'initial', count: 2 },
    ]);
    const stageCountByProject = await featureLifecycleReadModel.getStageCountByProject();
    expect(stageCountByProject).toMatchObject([
        { project: 'default', stage: 'pre-live', count: 1 },
        { project: 'default', stage: 'initial', count: 2 },
    ]);
});
//# sourceMappingURL=feature-lifecycle-read-model.test.js.map