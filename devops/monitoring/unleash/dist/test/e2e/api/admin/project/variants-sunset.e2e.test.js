"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_helper_1 = require("../../../helpers/test-helper");
const database_init_1 = __importDefault(require("../../../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../../fixtures/no-logger"));
const model_1 = require("../../../../../lib/types/model");
let app;
let db;
beforeAll(async () => {
    db = await (0, database_init_1.default)('project_feature_variants_api_sunset', no_logger_1.default);
    app = await (0, test_helper_1.setupAppWithCustomConfig)(db.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
                enableLegacyVariants: false,
            },
        },
    });
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});
beforeEach(async () => {
    await db.stores.featureToggleStore.deleteAll();
});
test('Cannot add environment variants to a new feature', async () => {
    const featureName = 'feature-variants-patch';
    await db.stores.featureToggleStore.create('default', {
        name: featureName,
        createdByUserId: 9999,
    });
    await db.stores.featureEnvironmentStore.addEnvironmentToFeature(featureName, 'development', true);
    const patch = [
        {
            op: 'add',
            path: '/0',
            value: {
                name: 'a',
                weightType: model_1.WeightType.VARIABLE,
                weight: 1000,
            },
        },
    ];
    await app.request
        .patch(`/api/admin/projects/default/features/${featureName}/environments/development/variants`)
        .send(patch)
        .expect(403)
        .expect((res) => {
        expect(res.body.message).toBe('Environment variants deprecated for feature: feature-variants-patch. Use strategy variants instead.');
    });
});
test('Can add environment variants when existing ones exist for this feature', async () => {
    const featureName = 'feature-variants-patch';
    await db.stores.featureToggleStore.create('default', {
        name: featureName,
        createdByUserId: 9999,
    });
    await db.stores.featureEnvironmentStore.addEnvironmentToFeature(featureName, 'development', true);
    await db.stores.featureToggleStore.saveVariants('default', featureName, [
        {
            name: 'existing-variant',
            stickiness: 'default',
            weight: 1000,
            weightType: model_1.WeightType.VARIABLE,
        },
    ]);
    const patch = [
        {
            op: 'add',
            path: '/0',
            value: {
                name: 'a',
                weightType: model_1.WeightType.VARIABLE,
                weight: 1000,
            },
        },
    ];
    await app.request
        .patch(`/api/admin/projects/default/features/${featureName}/environments/development/variants`)
        .send(patch)
        .expect(200);
});
//# sourceMappingURL=variants-sunset.e2e.test.js.map