"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../fixtures/no-logger"));
const test_helper_1 = require("../../helpers/test-helper");
let app;
let db;
const PATH = '/api/admin/constraints/validate';
beforeAll(async () => {
    db = await (0, database_init_1.default)('constraints', no_logger_1.default);
    app = await (0, test_helper_1.setupAppWithCustomConfig)(db.stores, {
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
test('should reject invalid constraints', async () => {
    await app.request.post(PATH).send({}).expect(400);
    await app.request.post(PATH).send({ a: 1 }).expect(400);
    await app.request.post(PATH).send({ operator: 'IN' }).expect(400);
    await app.request.post(PATH).send({ contextName: 'a' }).expect(400);
});
test('should accept valid constraints', async () => {
    await app.request
        .post(PATH)
        .send({ contextName: 'environment', operator: 'NUM_EQ', value: 1 })
        .expect(204);
    await app.request
        .post(PATH)
        .send({ contextName: 'environment', operator: 'IN', values: ['a'] })
        .expect(204);
});
//# sourceMappingURL=constraints.e2e.test.js.map