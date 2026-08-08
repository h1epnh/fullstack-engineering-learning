"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../../helpers/database-init"));
const test_helper_1 = require("../../../helpers/test-helper");
const no_logger_1 = __importDefault(require("../../../../fixtures/no-logger"));
let app;
let db;
let apiTokenStore;
beforeAll(async () => {
    db = await (0, database_init_1.default)('projects_api_serial', no_logger_1.default);
    app = await (0, test_helper_1.setupAppWithCustomConfig)(db.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
    }, db.rawDatabase);
    apiTokenStore = db.stores.apiTokenStore;
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});
test('Should always return token type in lowercase', async () => {
    await apiTokenStore.insert({
        environment: '*',
        alias: 'some-alias',
        secret: 'some-secret',
        type: 'FRONTEND',
        projects: ['default'],
        tokenName: 'some-name',
    });
    const storedToken = await apiTokenStore.get('some-secret');
    expect(storedToken.type).toBe('frontend');
    const { body } = await app.request
        .get('/api/admin/projects/default/api-tokens')
        .expect(200)
        .expect('Content-Type', /json/);
    expect(body.tokens).toHaveLength(1);
    expect(body.tokens[0].type).toBe('frontend');
});
//# sourceMappingURL=api-token.e2e.test.js.map