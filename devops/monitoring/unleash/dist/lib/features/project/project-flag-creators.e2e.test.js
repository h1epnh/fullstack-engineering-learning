"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../../test/e2e/helpers/database-init"));
const test_helper_1 = require("../../../test/e2e/helpers/test-helper");
const no_logger_1 = __importDefault(require("../../../test/fixtures/no-logger"));
let app;
let db;
beforeAll(async () => {
    db = await (0, database_init_1.default)('project_flag_creators', no_logger_1.default);
    app = await (0, test_helper_1.setupAppWithAuth)(db.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
    }, db.rawDatabase);
});
afterEach(async () => {
    await db.stores.featureToggleStore.deleteAll();
    await db.stores.userStore.deleteAll();
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});
test('should return flag creators', async () => {
    await app.request
        .post(`/auth/demo/login`)
        .send({
        email: 'user1@getunleash.io',
    })
        .expect(200);
    await app.createFeature('flag-name-1');
    await app.request
        .post(`/auth/demo/login`)
        .send({
        email: 'user2@getunleash.io',
    })
        .expect(200);
    await app.createFeature('flag-name-2');
    await app.archiveFeature('flag-name-2');
    const { body } = await app.request
        .get('/api/admin/projects/default/flag-creators')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(body).toEqual([{ id: 1, name: 'user1@getunleash.io' }]);
});
//# sourceMappingURL=project-flag-creators.e2e.test.js.map