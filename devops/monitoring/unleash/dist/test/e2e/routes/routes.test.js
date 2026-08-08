"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_helper_1 = require("../helpers/test-helper");
const database_init_1 = __importDefault(require("../helpers/database-init"));
let db;
let app;
beforeAll(async () => {
    db = await (0, database_init_1.default)('routes_test_serial');
    app = await (0, test_helper_1.setupAppWithBaseUrl)(db.stores);
});
afterAll(async () => {
    await app.destroy();
    if (db != null) {
        await db.destroy();
    }
});
test('hitting a baseUri path returns HTML document', async () => {
    expect.assertions(0);
    await app.request
        .get('/hosted/projects')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8');
});
test('hitting an api path that does not exist returns 404', async () => {
    expect.assertions(0);
    await app.request.get('/api/i-dont-exist').expect(404);
});
test('hitting an /admin/api returns HTML document', async () => {
    expect.assertions(0);
    await app.request
        .get('/hosted/admin/api')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8');
});
test('hitting a non-api returns HTML document', async () => {
    expect.assertions(0);
    await app.request
        .get('/hosted/i-dont-exist')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8');
});
//# sourceMappingURL=routes.test.js.map