"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_helper_1 = require("../../helpers/test-helper");
const database_init_1 = __importDefault(require("../../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../fixtures/no-logger"));
let stores;
let db;
let app;
beforeAll(async () => {
    db = await (0, database_init_1.default)('splash_api_serial', no_logger_1.default);
    stores = db.stores;
    const email = 'custom-user@mail.com';
    const preHook = (application, config, { userService }) => {
        application.use('/api/admin/', async (req, res, next) => {
            // @ts-ignore
            req.user = await userService.loginUserWithoutPassword(email, true);
            next();
        });
    };
    app = await (0, test_helper_1.setupAppWithCustomAuth)(stores, preHook, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
    });
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});
test('it updates splash for user', async () => {
    expect.assertions(1);
    return app.request
        .post('/api/admin/splash/environment')
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
        expect(res.body.seen).toBe(true);
    });
});
test('it retrieves splash for user', async () => {
    expect.assertions(1);
    return app.request
        .get('/api/admin/user')
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
        expect(res.body.splash).toStrictEqual({ environment: true });
    });
});
//# sourceMappingURL=splash.e2e.test.js.map