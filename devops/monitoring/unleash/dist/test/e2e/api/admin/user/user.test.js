"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../../fixtures/no-logger"));
const test_helper_1 = require("../../../helpers/test-helper");
let app;
let db;
const email = 'user@getunleash.io';
beforeAll(async () => {
    db = await (0, database_init_1.default)('user_api_serial', no_logger_1.default);
    app = await (0, test_helper_1.setupAppWithAuth)(db.stores);
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});
test('Should get my user data', async () => {
    // login
    await app.request
        .post('/auth/demo/login')
        .send({
        email,
    })
        .expect(200);
    // get user data
    await app.request
        .get('/api/admin/user')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
        expect(res.body.user.email).toBe(email);
        expect(res.body.permissions).toBeDefined();
    });
});
//# sourceMappingURL=user.test.js.map