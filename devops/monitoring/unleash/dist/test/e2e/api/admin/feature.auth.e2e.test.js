"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_helper_1 = require("../../helpers/test-helper");
const database_init_1 = __importDefault(require("../../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../fixtures/no-logger"));
let db;
beforeAll(async () => {
    db = await (0, database_init_1.default)('feature_api_auth', no_logger_1.default);
});
afterAll(async () => {
    await db.destroy();
});
test('creates new feature flag with createdBy', async () => {
    expect.assertions(1);
    const { request, destroy } = await (0, test_helper_1.setupAppWithAuth)(db.stores, {}, db.rawDatabase);
    // Login
    await request.post('/auth/demo/login').send({
        email: 'user@mail.com',
    });
    // create flag
    await request
        .post('/api/admin/projects/default/features')
        .send({
        name: 'com.test.Username',
        enabled: false,
        strategies: [{ name: 'default' }],
    })
        .expect(201);
    await request.get('/api/admin/events/com.test.Username').expect((res) => {
        expect(res.body.events[0].createdBy).toBe('user@mail.com');
    });
    await destroy();
});
test('should require authenticated user', async () => {
    expect.assertions(0);
    const { request, destroy } = await (0, test_helper_1.setupAppWithAuth)(db.stores);
    await request.get('/api/admin/projects/default/features').expect(401);
    await destroy();
});
//# sourceMappingURL=feature.auth.e2e.test.js.map