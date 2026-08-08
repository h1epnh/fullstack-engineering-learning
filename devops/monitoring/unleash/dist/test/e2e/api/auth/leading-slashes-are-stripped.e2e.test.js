"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const no_logger_1 = __importDefault(require("../../../fixtures/no-logger"));
const database_init_1 = __importDefault(require("../../helpers/database-init"));
const test_helper_1 = require("../../helpers/test-helper");
const types_1 = require("../../../../lib/types");
const api_token_1 = require("../../../../lib/types/models/api-token");
let app;
let appWithBaseUrl;
let stores;
let db;
beforeAll(async () => {
    db = await (0, database_init_1.default)('multiple_leading_slashes_are_still_authed_serial', no_logger_1.default);
    stores = db.stores;
    app = await (0, test_helper_1.setupAppWithAuth)(stores, {
        authentication: { enableApiToken: true, type: types_1.IAuthType.DEMO },
    }, db.rawDatabase);
    appWithBaseUrl = await (0, test_helper_1.setupAppWithAuth)(stores, {
        server: {
            unleashUrl: 'http://localhost:4242',
            basePathUri: '/demo',
        },
        authentication: { enableApiToken: true, type: types_1.IAuthType.DEMO },
    }, db.rawDatabase);
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});
test('Access to //api/admin/tags are refused no matter how many leading slashes', async () => {
    await app.request.get('//api/admin/tags').expect(401);
    await app.request.get('////api/admin/tags').expect(401);
});
test('Access to /api/client/features are refused no matter how many leading slashes', async () => {
    await app.request.get('/api/client/features').expect(401);
    await app.request.get('/////api/client/features').expect(401);
    await app.request.get('//api/client/features').expect(401);
});
test('multiple slashes after base path is also rejected with 404', async () => {
    await appWithBaseUrl.request.get('/demo///api/client/features').expect(401);
    await appWithBaseUrl.request.get('/demo//api/client/features').expect(401);
    await appWithBaseUrl.request.get('/demo/api/client/features').expect(401);
});
test('Access with API token is granted', async () => {
    const token = await app.services.apiTokenService.createApiTokenWithProjects({
        environment: 'default',
        projects: ['default'],
        tokenName: 'test',
        type: api_token_1.ApiTokenType.CLIENT,
    });
    await app.request
        .get('/api/client/features')
        .set('Authorization', token.secret)
        .expect(200);
});
//# sourceMappingURL=leading-slashes-are-stripped.e2e.test.js.map