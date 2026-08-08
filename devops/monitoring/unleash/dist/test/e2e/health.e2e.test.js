"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_helper_1 = require("./helpers/test-helper");
const database_init_1 = __importDefault(require("./helpers/database-init"));
const no_logger_1 = __importDefault(require("../fixtures/no-logger"));
let stores;
let db;
beforeAll(async () => {
    db = await (0, database_init_1.default)('health_api', no_logger_1.default);
    stores = db.stores;
});
afterAll(async () => {
    await db.destroy();
});
test('returns health good', async () => {
    expect.assertions(0);
    const { request, destroy } = await (0, test_helper_1.setupApp)(stores);
    await request
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect('{"health":"GOOD"}');
    await destroy();
});
//# sourceMappingURL=health.e2e.test.js.map