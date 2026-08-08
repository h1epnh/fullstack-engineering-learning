"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_config_1 = require("../../test/config/test-config");
const api_token_1 = require("../types/models/api-token");
const types_1 = require("../types");
const date_fns_1 = require("date-fns");
const util_1 = require("../util");
const createApiTokenService_1 = require("../features/api-tokens/createApiTokenService");
test('Should init api token', async () => {
    const token = {
        environment: '*',
        project: '*',
        secret: '*:*:some-random-string',
        type: api_token_1.ApiTokenType.ADMIN,
        tokenName: 'admin',
    };
    const config = (0, test_config_1.createTestConfig)({
        authentication: {
            initApiTokens: [token],
        },
        experimental: {
            flags: {
                useMemoizedActiveTokens: true,
            },
        },
    });
    const { apiTokenStore } = (0, createApiTokenService_1.createFakeApiTokenService)(config);
    const insertCalled = new Promise((resolve) => {
        apiTokenStore.on('insert', resolve);
    });
    await insertCalled;
    const tokens = await apiTokenStore.getAll();
    expect(tokens).toHaveLength(1);
});
test("Shouldn't return frontend token when secret is undefined", async () => {
    const token = {
        environment: 'default',
        projects: ['*'],
        secret: '*:*:some-random-string',
        type: api_token_1.ApiTokenType.FRONTEND,
        tokenName: 'front',
        expiresAt: undefined,
    };
    const config = (0, test_config_1.createTestConfig)({});
    const { environmentStore, apiTokenService } = (0, createApiTokenService_1.createFakeApiTokenService)(config);
    await environmentStore.create({
        name: 'default',
        enabled: true,
        type: 'test',
        sortOrder: 1,
    });
    await apiTokenService.createApiTokenWithProjects(token);
    await apiTokenService.fetchActiveTokens();
    expect(await apiTokenService.getUserForToken('')).toEqual(undefined);
});
test('Api token operations should all have events attached', async () => {
    const token = {
        environment: 'default',
        projects: ['*'],
        secret: '*:*:some-random-string',
        type: api_token_1.ApiTokenType.FRONTEND,
        tokenName: 'front',
        expiresAt: undefined,
    };
    const config = (0, test_config_1.createTestConfig)({});
    const { environmentStore, apiTokenService, eventService } = (0, createApiTokenService_1.createFakeApiTokenService)(config);
    await environmentStore.create({
        name: 'default',
        enabled: true,
        type: 'test',
        sortOrder: 1,
    });
    const saved = await apiTokenService.createApiTokenWithProjects(token);
    const newExpiry = (0, date_fns_1.addDays)(new Date(), 30);
    await apiTokenService.updateExpiry(saved.secret, newExpiry, types_1.TEST_AUDIT_USER);
    await apiTokenService.delete(saved.secret, types_1.TEST_AUDIT_USER);
    const { events } = await eventService.getEvents();
    const createdApiTokenEvents = events.filter((e) => e.type === types_1.API_TOKEN_CREATED);
    expect(createdApiTokenEvents).toHaveLength(1);
    expect(createdApiTokenEvents[0].preData).toBeUndefined();
    expect(createdApiTokenEvents[0].data.secret).toBeUndefined();
    const updatedApiTokenEvents = events.filter((e) => e.type === types_1.API_TOKEN_UPDATED);
    expect(updatedApiTokenEvents).toHaveLength(1);
    expect(updatedApiTokenEvents[0].preData.expiresAt).toBeUndefined();
    expect(updatedApiTokenEvents[0].preData.secret).toBeUndefined();
    expect(updatedApiTokenEvents[0].data.secret).toBeUndefined();
    expect(updatedApiTokenEvents[0].data.expiresAt).toBe(newExpiry);
    const deletedApiTokenEvents = events.filter((e) => e.type === types_1.API_TOKEN_DELETED);
    expect(deletedApiTokenEvents).toHaveLength(1);
    expect(deletedApiTokenEvents[0].data).toBeUndefined();
    expect(deletedApiTokenEvents[0].preData).toBeDefined();
    expect(deletedApiTokenEvents[0].preData.secret).toBeUndefined();
});
test('getUserForToken should get a user with admin token user id and token name', async () => {
    const config = (0, test_config_1.createTestConfig)();
    const { apiTokenService } = (0, createApiTokenService_1.createFakeApiTokenService)(config);
    const token = await apiTokenService.createApiTokenWithProjects({
        environment: '*',
        projects: ['*'],
        type: api_token_1.ApiTokenType.ADMIN,
        tokenName: 'admin.token',
    }, (0, util_1.extractAuditInfoFromUser)(types_1.ADMIN_TOKEN_USER));
    const user = await apiTokenService.getUserForToken(token.secret);
    expect(user).toBeDefined();
    expect(user.username).toBe(token.tokenName);
    expect(user.internalAdminTokenUserId).toBe(types_1.ADMIN_TOKEN_USER.id);
});
describe('API token getTokenWithCache', () => {
    const token = {
        environment: 'default',
        projects: ['*'],
        secret: '*:*:some-random-string',
        type: api_token_1.ApiTokenType.CLIENT,
        tokenName: 'new-token-by-another-instance',
        expiresAt: undefined,
    };
    const setup = (options) => {
        const config = (0, test_config_1.createTestConfig)(options);
        const { apiTokenService, apiTokenStore } = (0, createApiTokenService_1.createFakeApiTokenService)(config);
        return {
            apiTokenService,
            apiTokenStore,
        };
    };
    test('should return the token and perform only one db query', async () => {
        const { apiTokenService, apiTokenStore } = setup();
        const apiTokenStoreGet = jest.spyOn(apiTokenStore, 'get');
        // valid token not present in cache (could be inserted by another instance)
        apiTokenStore.insert(token);
        for (let i = 0; i < 5; i++) {
            const found = await apiTokenService.getTokenWithCache(token.secret);
            expect(found).toBeDefined();
            expect(found?.tokenName).toBe(token.tokenName);
            expect(found?.createdAt).toBeDefined();
        }
        expect(apiTokenStoreGet).toHaveBeenCalledTimes(1);
    });
    test('should query the db only once for invalid tokens', async () => {
        jest.useFakeTimers();
        const { apiTokenService, apiTokenStore } = setup();
        const apiTokenStoreGet = jest.spyOn(apiTokenStore, 'get');
        const invalidToken = 'invalid-token';
        for (let i = 0; i < 5; i++) {
            expect(await apiTokenService.getTokenWithCache(invalidToken)).toBeUndefined();
        }
        expect(apiTokenStoreGet).toHaveBeenCalledTimes(1);
        // after more than 5 minutes we should be able to query again
        jest.advanceTimersByTime((0, date_fns_1.minutesToMilliseconds)(6));
        for (let i = 0; i < 5; i++) {
            expect(await apiTokenService.getTokenWithCache(invalidToken)).toBeUndefined();
        }
        expect(apiTokenStoreGet).toHaveBeenCalledTimes(2);
    });
    test('should not return the token if it has expired and shoud perform only one db query', async () => {
        const { apiTokenService, apiTokenStore } = setup();
        const apiTokenStoreGet = jest.spyOn(apiTokenStore, 'get');
        // valid token not present in cache but expired
        apiTokenStore.insert({ ...token, expiresAt: (0, date_fns_1.subDays)(new Date(), 1) });
        for (let i = 0; i < 5; i++) {
            const found = await apiTokenService.getTokenWithCache(token.secret);
            expect(found).toBeUndefined();
        }
        expect(apiTokenStoreGet).toHaveBeenCalledTimes(1);
    });
});
test('normalizes api token type casing to lowercase', async () => {
    const config = (0, test_config_1.createTestConfig)();
    const { apiTokenStore, apiTokenService, environmentStore } = (0, createApiTokenService_1.createFakeApiTokenService)(config);
    await environmentStore.create({
        name: 'default',
        enabled: true,
        type: 'test',
        sortOrder: 1,
    });
    const apiTokenStoreInsert = jest.spyOn(apiTokenStore, 'insert');
    await apiTokenService.createApiTokenWithProjects({
        environment: 'default',
        // @ts-ignore
        type: 'CLIENT',
        projects: [],
        tokenName: 'uppercase-token',
    }, types_1.SYSTEM_USER);
    await apiTokenService.createApiTokenWithProjects({
        environment: 'default',
        // @ts-ignore
        type: 'client',
        projects: [],
        tokenName: 'lowercase-token',
    }, types_1.SYSTEM_USER);
    expect(apiTokenStoreInsert).toHaveBeenCalledWith(expect.objectContaining({
        type: 'client',
    }));
    expect(apiTokenStoreInsert).not.toHaveBeenCalledWith(expect.objectContaining({
        type: 'CLIENT',
    }));
    const tokens = await apiTokenStore.getAll();
    expect(tokens.every((token) => token.type === 'client')).toBeTruthy();
});
//# sourceMappingURL=api-token-service.test.js.map