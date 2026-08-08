"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../fixtures/no-logger"));
const test_config_1 = require("../../config/test-config");
const api_token_1 = require("../../../lib/types/models/api-token");
const constants_1 = require("../../../lib/util/constants");
const date_fns_1 = require("date-fns");
const features_1 = require("../../../lib/features");
const services_1 = require("../../../lib/services");
const types_1 = require("../../../lib/types");
const createApiTokenService_1 = require("../../../lib/features/api-tokens/createApiTokenService");
let db;
let stores;
let edgeService;
let projectService;
beforeAll(async () => {
    const config = (0, test_config_1.createTestConfig)({
        server: { baseUriPath: '/test' },
        experimental: {
            flags: {
                useMemoizedActiveTokens: true,
            },
        },
    });
    db = await (0, database_init_1.default)('api_token_service_serial', no_logger_1.default);
    stores = db.stores;
    const project = {
        id: 'test-project',
        name: 'Test Project',
        description: 'Fancy',
        mode: 'open',
        defaultStickiness: 'clientId',
    };
    const user = await stores.userStore.insert({
        name: 'Some Name',
        email: 'test@getunleash.io',
    });
    projectService = (0, features_1.createProjectService)(db.rawDatabase, config);
    await projectService.createProject(project, user, types_1.TEST_AUDIT_USER);
    const apiTokenService = (0, createApiTokenService_1.createApiTokenService)(db.rawDatabase, config);
    edgeService = new services_1.EdgeService({ apiTokenService }, config);
});
afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});
afterEach(async () => {
    const tokens = await stores.apiTokenStore.getAll();
    const deleteAll = tokens.map((t) => stores.apiTokenStore.delete(t.secret));
    await Promise.all(deleteAll);
});
test('should only return valid tokens', async () => {
    const now = Date.now();
    const yesterday = (0, date_fns_1.subDays)(now, 1);
    const tomorrow = (0, date_fns_1.addDays)(now, 1);
    const expiredToken = await stores.apiTokenStore.insert({
        tokenName: 'expired',
        secret: '*:environment.expired-secret',
        type: api_token_1.ApiTokenType.CLIENT,
        expiresAt: yesterday,
        projects: ['*'],
        environment: constants_1.DEFAULT_ENV,
    });
    const activeToken = await stores.apiTokenStore.insert({
        tokenName: 'default-valid',
        secret: '*:environment.valid-secret',
        type: api_token_1.ApiTokenType.CLIENT,
        expiresAt: tomorrow,
        projects: ['*'],
        environment: constants_1.DEFAULT_ENV,
    });
    const response = await edgeService.getValidTokens([
        activeToken.secret,
        expiredToken.secret,
    ]);
    expect(response.tokens.length).toBe(1);
    expect(activeToken.secret).toBe(response.tokens[0].token);
});
//# sourceMappingURL=edge-service.e2e.test.js.map