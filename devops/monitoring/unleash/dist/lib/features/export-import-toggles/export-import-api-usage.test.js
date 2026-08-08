"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_helper_1 = require("../../../test/e2e/helpers/test-helper");
const database_init_1 = __importDefault(require("../../../test/e2e/helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../test/fixtures/no-logger"));
const types_1 = require("../../types");
const util_1 = require("../../util");
const api_token_1 = require("../../types/models/api-token");
const server_impl_1 = require("../../server-impl");
let db;
beforeAll(async () => {
    db = await (0, database_init_1.default)('export_import_api_admin', no_logger_1.default);
});
afterAll(async () => {
    await db.destroy();
});
const defaultImportPayload = {
    data: {
        features: [
            {
                project: 'old_project',
                name: 'first_feature',
            },
        ],
        featureStrategies: [],
        featureEnvironments: [],
        featureTags: [],
        tagTypes: [],
        contextFields: [],
        segments: [],
    },
    project: types_1.DEFAULT_PROJECT,
    environment: util_1.DEFAULT_ENV,
};
test('reject API imports with admin tokens', async () => {
    const preHook = (app) => {
        app.use('/api/admin/', async (req, res, next) => {
            const user = new server_impl_1.ApiUser({
                permissions: ['ADMIN'],
                environment: '*',
                type: api_token_1.ApiTokenType.ADMIN,
                tokenName: 'tokenName',
                secret: 'secret',
                projects: ['*'],
            });
            req.user = user;
            next();
        });
    };
    const { request, destroy } = await (0, test_helper_1.setupAppWithCustomAuth)(db.stores, preHook);
    const { body } = await request
        .post('/api/admin/features-batch/import')
        .send(defaultImportPayload)
        .expect(400);
    expect(body).toMatchObject({
        message: 
        // it tells the user that they used an admin token
        expect.stringContaining('admin') &&
            // it tells the user to use a personal access token
            expect.stringContaining('personal access token') &&
            // it tells the user to use a service account
            expect.stringContaining('service account'),
    });
    await destroy();
});
//# sourceMappingURL=export-import-api-usage.test.js.map