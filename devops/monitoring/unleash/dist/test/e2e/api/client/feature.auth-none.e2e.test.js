"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_helper_1 = require("../../helpers/test-helper");
const database_init_1 = __importDefault(require("../../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../fixtures/no-logger"));
const constants_1 = require("../../../../lib/util/constants");
const api_token_1 = require("../../../../lib/types/models/api-token");
const types_1 = require("../../../../lib/types");
let app;
let db;
const testUser = { name: 'test', id: -9999 };
let clientSecret;
let frontendSecret;
beforeAll(async () => {
    db = await (0, database_init_1.default)('feature_api_client_auth_none', no_logger_1.default);
    app = await (0, test_helper_1.setupAppWithCustomConfig)(db.stores, {
        authentication: {
            type: 'none',
        },
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
    }, db.rawDatabase);
    await app.services.featureToggleService.createFeatureToggle('default', {
        name: 'feature_1',
        description: 'the #1 feature',
        impressionData: true,
    }, types_1.TEST_AUDIT_USER);
    await app.services.featureToggleService.createFeatureToggle('default', {
        name: 'feature_2',
        description: 'soon to be the #1 feature',
    }, types_1.TEST_AUDIT_USER);
    await app.services.featureToggleService.createFeatureToggle('default', {
        name: 'feature_3',
        description: 'terrible feature',
    }, types_1.TEST_AUDIT_USER);
    const token = await app.services.apiTokenService.createApiTokenWithProjects({
        tokenName: 'test',
        type: api_token_1.ApiTokenType.CLIENT,
        environment: constants_1.DEFAULT_ENV,
        projects: ['default'],
    });
    clientSecret = token.secret;
    const frontendToken = await app.services.apiTokenService.createApiTokenWithProjects({
        tokenName: 'test',
        type: api_token_1.ApiTokenType.FRONTEND,
        environment: constants_1.DEFAULT_ENV,
        projects: ['default'],
    });
    frontendSecret = frontendToken.secret;
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});
test('returns three feature flags', async () => {
    return app.request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
        expect(res.body.features).toHaveLength(3);
    });
});
test('returns 401 for incorrect api token', async () => {
    return app.request
        .get('/api/client/features')
        .set('Authorization', 'some-invalid-token')
        .expect('Content-Type', /json/)
        .expect(401);
});
test('returns success for correct api token', async () => {
    return app.request
        .get('/api/client/features')
        .set('Authorization', clientSecret)
        .expect('Content-Type', /json/)
        .expect(200);
});
test('returns successful for frontend API without token', async () => {
    return app.request
        .get('/api/frontend')
        .expect('Content-Type', /json/)
        .expect(200);
});
test('returns 401 for frontend API with invalid token', async () => {
    return app.request
        .get('/api/frontend')
        .expect('Content-Type', /json/)
        .set('Authorization', 'some-invalid-token')
        .expect(401);
});
test('returns 200 for frontend API with valid token', async () => {
    return app.request
        .get('/api/frontend')
        .expect('Content-Type', /json/)
        .set('Authorization', frontendSecret)
        .expect(200);
});
//# sourceMappingURL=feature.auth-none.e2e.test.js.map