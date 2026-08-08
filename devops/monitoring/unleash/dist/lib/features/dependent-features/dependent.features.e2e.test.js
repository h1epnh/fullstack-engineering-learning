"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const database_init_1 = __importDefault(require("../../../test/e2e/helpers/database-init"));
const test_helper_1 = require("../../../test/e2e/helpers/test-helper");
const no_logger_1 = __importDefault(require("../../../test/fixtures/no-logger"));
const types_1 = require("../../types");
const util_1 = require("../../util");
let app;
let db;
let eventStore;
beforeAll(async () => {
    db = await (0, database_init_1.default)('dependent_features', no_logger_1.default, {
        dbInitMethod: 'legacy',
    });
    app = await (0, test_helper_1.setupAppWithCustomConfig)(db.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
                enableLegacyVariants: true,
            },
        },
    }, db.rawDatabase);
    eventStore = db.stores.eventStore;
});
const createProject = async (name) => {
    await db.stores.projectStore.create({
        name: name,
        description: '',
        id: name,
        mode: 'open',
    });
};
const getRecordedEventTypesForDependencies = async () => (await eventStore.getEvents())
    .map((event) => event.type)
    .filter((type) => type.includes('depend'));
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});
beforeEach(async () => {
    await db.stores.dependentFeaturesStore.deleteAll();
    await db.stores.featureToggleStore.deleteAll();
    await db.stores.featureEnvironmentStore.deleteAll();
    await db.stores.eventStore.deleteAll();
});
const addFeatureDependency = async (childFeature, payload, expectedCode = 200) => {
    return app.request
        .post(`/api/admin/projects/default/features/${childFeature}/dependencies`)
        .send(payload)
        .expect(expectedCode);
};
const deleteFeatureDependency = async (childFeature, parentFeature, expectedCode = 200) => {
    return app.request
        .delete(`/api/admin/projects/default/features/${childFeature}/dependencies/${parentFeature}`)
        .expect(expectedCode);
};
const deleteFeatureDependencies = async (childFeature, expectedCode = 200) => {
    return app.request
        .delete(`/api/admin/projects/default/features/${childFeature}/dependencies`)
        .expect(expectedCode);
};
const getPossibleParentFeatures = async (childFeature, expectedCode = 200) => {
    return app.request
        .get(`/api/admin/projects/default/features/${childFeature}/parents`)
        .expect(expectedCode);
};
const getPossibleParentVariants = async (parentFeature, expectedCode = 200) => {
    return app.request
        .get(`/api/admin/projects/default/features/${parentFeature}/parent-variants`)
        .expect(expectedCode);
};
const addStrategyVariants = async (parent, variants) => {
    await app.addStrategyToFeatureEnv({
        name: 'flexibleRollout',
        constraints: [],
        parameters: { rollout: '100', stickiness: 'default' },
        variants: variants.map((name) => ({
            name,
            weight: 1000,
            weightType: 'variable',
            stickiness: 'default',
        })),
    }, util_1.DEFAULT_ENV, parent);
};
const addFeatureEnvironmentVariant = async (parent, variant) => {
    await app.request
        .patch(`/api/admin/projects/default/features/${parent}/environments/${util_1.DEFAULT_ENV}/variants`)
        .set('Content-Type', 'application/json')
        .send([
        {
            op: 'add',
            path: '/0',
            value: {
                name: variant,
                weightType: 'variable',
                weight: 1000,
                overrides: [],
                stickiness: 'default',
            },
        },
    ])
        .expect(200);
};
const checkDependenciesExist = async (expectedCode = 200) => {
    return app.request
        .get(`/api/admin/projects/default/dependencies`)
        .expect(expectedCode);
};
test('should add and delete feature dependencies', async () => {
    const parent = (0, uuid_1.v4)();
    const child = (0, uuid_1.v4)();
    const child2 = (0, uuid_1.v4)();
    await app.createFeature(parent);
    await app.createFeature(child);
    await app.createFeature(child2);
    const { body: options } = await getPossibleParentFeatures(child);
    expect(options).toMatchObject([parent, child2].sort());
    // save explicit enabled and variants
    await addFeatureDependency(child, {
        feature: parent,
        enabled: false,
    });
    // overwrite with implicit enabled: true and variants
    await addFeatureDependency(child, {
        feature: parent,
        variants: ['variantB'],
    });
    await addFeatureDependency(child2, {
        feature: parent,
        enabled: false,
    });
    await deleteFeatureDependency(child, parent); // single
    await deleteFeatureDependencies(child2); // all
    const eventTypes = await getRecordedEventTypesForDependencies();
    expect(eventTypes).toStrictEqual([
        types_1.FEATURE_DEPENDENCIES_REMOVED,
        types_1.FEATURE_DEPENDENCY_REMOVED,
        types_1.FEATURE_DEPENDENCY_ADDED,
        types_1.FEATURE_DEPENDENCY_ADDED,
        types_1.FEATURE_DEPENDENCY_ADDED,
    ]);
});
test('should sort potential parent features alphabetically', async () => {
    const parent1 = `a${(0, uuid_1.v4)()}`;
    const parent2 = `c${(0, uuid_1.v4)()}`;
    const parent3 = `b${(0, uuid_1.v4)()}`;
    const child = (0, uuid_1.v4)();
    await app.createFeature(parent1);
    await app.createFeature(parent2);
    await app.createFeature(parent3);
    await app.createFeature(child);
    const { body: options } = await getPossibleParentFeatures(child);
    expect(options).toStrictEqual([parent1, parent3, parent2]);
});
test('should sort potential parent variants', async () => {
    const parent = (0, uuid_1.v4)();
    await app.createFeature(parent);
    await addFeatureEnvironmentVariant(parent, 'e');
    await addStrategyVariants(parent, ['c', 'a', 'd']);
    await addStrategyVariants(parent, ['b', 'd']);
    const { body: variants } = await getPossibleParentVariants(parent);
    expect(variants).toStrictEqual(['a', 'b', 'c', 'd', 'e']);
});
test('should not allow to add grandparent', async () => {
    const grandparent = (0, uuid_1.v4)();
    const parent = (0, uuid_1.v4)();
    const child = (0, uuid_1.v4)();
    await app.createFeature(grandparent);
    await app.createFeature(parent);
    await app.createFeature(child);
    await addFeatureDependency(child, {
        feature: parent,
    });
    await addFeatureDependency(parent, {
        feature: grandparent,
    }, 403);
});
test('should not allow to add grandchild', async () => {
    const grandparent = (0, uuid_1.v4)();
    const parent = (0, uuid_1.v4)();
    const child = (0, uuid_1.v4)();
    await app.createFeature(grandparent);
    await app.createFeature(parent);
    await app.createFeature(child);
    await addFeatureDependency(parent, {
        feature: grandparent,
    });
    await addFeatureDependency(child, {
        feature: parent,
    }, 403);
});
test('should not allow to add non-existent parent dependency', async () => {
    const parent = (0, uuid_1.v4)();
    const child = (0, uuid_1.v4)();
    await app.createFeature(child);
    await addFeatureDependency(child, {
        feature: parent,
    }, 403);
});
test('should not allow to add archived parent dependency', async () => {
    const parent = (0, uuid_1.v4)();
    const child = (0, uuid_1.v4)();
    await app.createFeature(child);
    await app.createFeature(parent);
    await app.archiveFeature(parent);
    await addFeatureDependency(child, {
        feature: parent,
    }, 403);
});
test('should check if any dependencies exist', async () => {
    const parent = (0, uuid_1.v4)();
    const child = (0, uuid_1.v4)();
    await app.createFeature(child);
    await app.createFeature(parent);
    const { body: dependenciesExistBefore } = await checkDependenciesExist();
    expect(dependenciesExistBefore).toBe(false);
    await addFeatureDependency(child, {
        feature: parent,
    });
    const { body: dependenciesExistAfter } = await checkDependenciesExist();
    expect(dependenciesExistAfter).toBe(true);
});
test('should not allow to add dependency to self', async () => {
    const parent = (0, uuid_1.v4)();
    await app.createFeature(parent);
    await addFeatureDependency(parent, {
        feature: parent,
    }, 403);
});
test('should not allow to add dependency to feature from another project', async () => {
    const child = (0, uuid_1.v4)();
    const parent = (0, uuid_1.v4)();
    await app.createFeature(parent);
    await createProject('another-project');
    await app.createFeature(child, 'another-project');
    await addFeatureDependency(child, {
        feature: parent,
    }, 403);
});
test('should create feature-dependency-removed when archiving and has dependency', async () => {
    const child = (0, uuid_1.v4)();
    const parent = (0, uuid_1.v4)();
    await app.createFeature(parent);
    await app.createFeature(child);
    await addFeatureDependency(child, {
        feature: parent,
    });
    await app.archiveFeature(child);
    const events = await eventStore.getEvents();
    expect(events).toEqual(expect.arrayContaining([
        expect.objectContaining({ type: 'feature-dependencies-removed' }),
    ]));
});
test('should not create feature-dependency-removed when archiving and no dependency', async () => {
    const child = (0, uuid_1.v4)();
    const parent = (0, uuid_1.v4)();
    await app.createFeature(parent);
    await app.createFeature(child);
    await app.archiveFeature(child);
    const events = await eventStore.getEvents();
    expect(events).not.toEqual(expect.arrayContaining([
        expect.objectContaining({ type: 'feature-dependencies-removed' }),
    ]));
});
//# sourceMappingURL=dependent.features.e2e.test.js.map