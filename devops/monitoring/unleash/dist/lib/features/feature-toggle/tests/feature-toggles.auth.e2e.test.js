"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../../../test/e2e/helpers/database-init"));
const test_helper_1 = require("../../../../test/e2e/helpers/test-helper");
const no_logger_1 = __importDefault(require("../../../../test/fixtures/no-logger"));
const util_1 = require("../../../util");
const types_1 = require("../../../types");
let app;
let db;
beforeAll(async () => {
    db = await (0, database_init_1.default)('feature_strategy_auth_api_serial', no_logger_1.default, {
        dbInitMethod: 'legacy',
    });
    app = await (0, test_helper_1.setupAppWithAuth)(db.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
                anonymiseEventLog: true,
            },
        },
    }, db.rawDatabase);
});
afterEach(async () => {
    const all = await db.stores.projectStore.getEnvironmentsForProject('default');
    await Promise.all(all
        .filter((env) => env.environment !== util_1.DEFAULT_ENV)
        .map(async (env) => db.stores.projectStore.deleteEnvironmentForProject('default', env.environment)));
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});
test('Should not be possible to update feature flag without permission', async () => {
    const email = 'user@mail.com';
    const url = '/api/admin/projects/default/features';
    const name = 'auth.flag.update';
    await db.stores.featureToggleStore.create('default', {
        name,
        createdByUserId: 9999,
    });
    await app.services.userService.createUser({
        email,
        rootRole: types_1.RoleName.VIEWER,
    }, types_1.TEST_AUDIT_USER);
    await app.request.post('/auth/demo/login').send({
        email,
    });
    await app.request
        .put(`${url}/${name}`)
        .send({ name, description: 'updated', type: 'kill-switch' })
        .expect(403);
});
test('Should be possible to update feature flag with permission', async () => {
    const email = 'user2@mail.com';
    const url = '/api/admin/projects/default/features';
    const name = 'auth.flag.update2';
    await db.stores.featureToggleStore.create('default', {
        name,
        createdByUserId: 9999,
    });
    await app.services.userService.createUser({
        email,
        rootRole: types_1.RoleName.EDITOR,
    }, types_1.TEST_AUDIT_USER);
    await app.request.post('/auth/demo/login').send({
        email,
    });
    await app.request
        .put(`${url}/${name}`)
        .send({ name, description: 'updated', type: 'kill-switch' })
        .expect(200);
});
test('Should not be possible auto-enable feature flag without CREATE_FEATURE_STRATEGY permission', async () => {
    const email = 'user33@mail.com';
    const url = '/api/admin/projects/default/features';
    const name = 'auth.flag.enable';
    await app.services.featureToggleService.createFeatureToggle('default', { name }, types_1.TEST_AUDIT_USER, true);
    await app.services.userService.createUser({
        email,
        rootRole: types_1.RoleName.EDITOR,
    }, types_1.TEST_AUDIT_USER);
    await app.request.post('/auth/demo/login').send({
        email,
    });
    const role = await db.stores.roleStore.getRoleByName(types_1.RoleName.EDITOR);
    await db.stores.accessStore.removePermissionFromRole(role.id, types_1.CREATE_FEATURE_STRATEGY, 'default');
    await app.request
        .post(`${url}/${name}/environments/default/on`)
        .expect(403);
});
test('Should read flag creator and collaborators', async () => {
    const email = 'user@getunleash.io';
    const url = '/api/admin/projects/default/features/';
    const name = 'creator.flag';
    const user = await app.services.userService.createUser({
        email,
        rootRole: types_1.RoleName.EDITOR,
    }, types_1.TEST_AUDIT_USER);
    await app.services.featureToggleService.createFeatureToggle('default', {
        name,
        createdByUserId: user.id,
    }, { id: user.id, username: 'irrelevant', ip: '::1' });
    await app.request.post('/auth/demo/login').send({
        email,
    });
    const { body: feature } = await app.request
        .get(`${url}/${name}`)
        .expect(200);
    const expectedUser = {
        id: user.id,
        name: '3957b71c0@unleash.run',
        imageUrl: 'https://gravatar.com/avatar/3957b71c0a6d2528f03b423f432ed2efe855d263400f960248a1080493d9d68a?s=42&d=retro&r=g',
    };
    expect(feature.createdBy).toEqual(expectedUser);
    expect(feature.collaborators).toStrictEqual({
        users: [expectedUser],
    });
});
//# sourceMappingURL=feature-toggles.auth.e2e.test.js.map