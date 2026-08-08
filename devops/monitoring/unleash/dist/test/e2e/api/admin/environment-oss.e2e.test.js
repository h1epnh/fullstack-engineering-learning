"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_helper_1 = require("../../helpers/test-helper");
const database_init_1 = __importDefault(require("../../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../fixtures/no-logger"));
let app;
let db;
beforeAll(async () => {
    db = await (0, database_init_1.default)('environment_api_is_oss_serial', no_logger_1.default, {
        isOss: true,
    });
    app = await (0, test_helper_1.setupAppWithCustomConfig)(db.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
        isOss: true,
    }, db.rawDatabase);
    await db.stores.environmentStore.create({
        name: 'customenvironment',
        type: 'production',
        enabled: true,
    });
    await db.stores.environmentStore.create({
        name: 'customenvironment2',
        type: 'production',
        enabled: true,
    });
    await db.stores.environmentStore.create({
        name: 'customenvironment3',
        type: 'production',
        enabled: true,
    });
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});
test('querying environments in OSS only returns environments that are included in oss', async () => {
    await app.request
        .get('/api/admin/environments')
        .expect(200)
        .expect((res) => {
        expect(res.body.environments).toHaveLength(3);
        const names = res.body.environments.map((env) => env.name);
        expect(names).toEqual(['default', 'development', 'production']);
    });
});
//# sourceMappingURL=environment-oss.e2e.test.js.map