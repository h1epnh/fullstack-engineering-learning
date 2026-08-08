"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_helper_1 = require("../../helpers/test-helper");
const authentication_required_1 = __importDefault(require("../../../../lib/types/authentication-required"));
const database_init_1 = __importDefault(require("../../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../fixtures/no-logger"));
let stores;
let db;
beforeAll(async () => {
    db = await (0, database_init_1.default)('feature_api_custom_auth', no_logger_1.default);
    stores = db.stores;
});
afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});
test('should require authenticated user', async () => {
    expect.assertions(0);
    const preHook = (app) => {
        app.use('/api/admin/', (req, res) => res
            .status(401)
            .json(new authentication_required_1.default({
            path: '/auth/demo/login',
            type: 'custom',
            message: 'You have to identify yourself.',
        }))
            .end());
    };
    const { request, destroy } = await (0, test_helper_1.setupAppWithCustomAuth)(stores, preHook);
    await request.get('/api/admin/projects/default/features').expect(401);
    await destroy();
});
test('creates new feature flag with createdBy', async () => {
    expect.assertions(1);
    const email = 'custom-user@mail.com';
    const preHook = (app, config, { userService }) => {
        app.use('/api/admin/', async (req, res, next) => {
            req.user = await userService.loginUserWithoutPassword(email, true);
            next();
        });
    };
    const { request, destroy } = await (0, test_helper_1.setupAppWithCustomAuth)(stores, preHook, {}, db.rawDatabase);
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
        expect(res.body.events[0].createdBy).toBe(email);
    });
    await destroy();
});
//# sourceMappingURL=feature.custom-auth.e2e.test.js.map