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
const types_1 = require("../../../lib/types");
const createApiTokenService_1 = require("../../../lib/features/api-tokens/createApiTokenService");
let db;
let stores;
let apiTokenService;
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
    apiTokenService = (0, createApiTokenService_1.createApiTokenService)(db.rawDatabase, config);
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
test('should have empty list of tokens', async () => {
    const allTokens = await apiTokenService.getAllTokens();
    const activeTokens = await apiTokenService.getAllTokens();
    expect(allTokens.length).toBe(0);
    expect(activeTokens.length).toBe(0);
});
test('should create client token', async () => {
    const token = await apiTokenService.createApiToken({
        tokenName: 'default-client',
        type: api_token_1.ApiTokenType.CLIENT,
        project: '*',
        environment: constants_1.DEFAULT_ENV,
    });
    const allTokens = await apiTokenService.getAllTokens();
    expect(allTokens.length).toBe(1);
    expect(token.secret.length > 32).toBe(true);
    expect(token.type).toBe(api_token_1.ApiTokenType.CLIENT);
    expect(token.username).toBe('default-client');
    expect(allTokens[0].secret).toBe(token.secret);
});
test('should create admin token', async () => {
    const token = await apiTokenService.createApiToken({
        tokenName: 'admin',
        type: api_token_1.ApiTokenType.ADMIN,
        project: '*',
        environment: '*',
    });
    expect(token.secret.length > 32).toBe(true);
    expect(token.type).toBe(api_token_1.ApiTokenType.ADMIN);
});
test('should set expiry of token', async () => {
    const time = new Date('2022-01-01');
    await apiTokenService.createApiToken({
        tokenName: 'default-client',
        type: api_token_1.ApiTokenType.CLIENT,
        expiresAt: time,
        project: '*',
        environment: constants_1.DEFAULT_ENV,
    });
    const [token] = await apiTokenService.getAllTokens();
    expect(token.expiresAt).toEqual(time);
});
test('should update expiry of token', async () => {
    const time = new Date('2022-01-01');
    const newTime = new Date('2023-01-01');
    const token = await apiTokenService.createApiToken({
        tokenName: 'default-client',
        type: api_token_1.ApiTokenType.CLIENT,
        expiresAt: time,
        project: '*',
        environment: constants_1.DEFAULT_ENV,
    }, types_1.TEST_AUDIT_USER);
    await apiTokenService.updateExpiry(token.secret, newTime, types_1.TEST_AUDIT_USER);
    const [updatedToken] = await apiTokenService.getAllTokens();
    expect(updatedToken.expiresAt).toEqual(newTime);
});
test('should create client token with project list', async () => {
    const token = await apiTokenService.createApiToken({
        tokenName: 'default-client',
        type: api_token_1.ApiTokenType.CLIENT,
        projects: ['default', 'test-project'],
        environment: constants_1.DEFAULT_ENV,
    });
    expect(token.secret.slice(0, 2)).toEqual('[]');
    expect(token.projects).toStrictEqual(['default', 'test-project']);
});
test('should strip all other projects if ALL_PROJECTS is present', async () => {
    const token = await apiTokenService.createApiToken({
        tokenName: 'default-client',
        type: api_token_1.ApiTokenType.CLIENT,
        projects: ['*', 'default'],
        environment: constants_1.DEFAULT_ENV,
    });
    expect(token.projects).toStrictEqual(['*']);
});
test('should return user with multiple projects', async () => {
    const now = Date.now();
    const tomorrow = (0, date_fns_1.addDays)(now, 1);
    const { secret: secret1 } = await apiTokenService.createApiToken({
        tokenName: 'default-valid',
        type: api_token_1.ApiTokenType.CLIENT,
        expiresAt: tomorrow,
        projects: ['test-project', 'default'],
        environment: constants_1.DEFAULT_ENV,
    });
    const { secret: secret2 } = await apiTokenService.createApiToken({
        tokenName: 'default-also-valid',
        type: api_token_1.ApiTokenType.CLIENT,
        expiresAt: tomorrow,
        projects: ['test-project'],
        environment: constants_1.DEFAULT_ENV,
    });
    const multiProjectUser = await apiTokenService.getUserForToken(secret1);
    const singleProjectUser = await apiTokenService.getUserForToken(secret2);
    expect(multiProjectUser.projects).toStrictEqual([
        'test-project',
        'default',
    ]);
    expect(singleProjectUser.projects).toStrictEqual(['test-project']);
});
test('should not partially create token if projects are invalid', async () => {
    try {
        await apiTokenService.createApiTokenWithProjects({
            tokenName: 'default-client',
            type: api_token_1.ApiTokenType.CLIENT,
            projects: ['non-existent-project'],
            environment: constants_1.DEFAULT_ENV,
        });
    }
    catch (e) { }
    const allTokens = await apiTokenService.getAllTokens();
    expect(allTokens.length).toBe(0);
});
//# sourceMappingURL=api-token-service.e2e.test.js.map