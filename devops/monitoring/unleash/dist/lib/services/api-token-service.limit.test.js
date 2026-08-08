"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_config_1 = require("../../test/config/test-config");
const api_token_1 = require("../types/models/api-token");
const exceeds_limit_error_1 = require("../error/exceeds-limit-error");
const createApiTokenService_1 = require("../features/api-tokens/createApiTokenService");
const createServiceWithLimit = (limit) => {
    const config = (0, test_config_1.createTestConfig)({
        experimental: {
            flags: {},
        },
    });
    config.resourceLimits.apiTokens = limit;
    const { apiTokenService, environmentStore } = (0, createApiTokenService_1.createFakeApiTokenService)(config);
    environmentStore.create({
        name: 'production',
        type: 'production',
        enabled: true,
        sortOrder: 1,
    });
    return apiTokenService;
};
test('Should allow you to create tokens up to and including the limit', async () => {
    const limit = 3;
    const service = createServiceWithLimit(limit);
    for (let i = 0; i < limit; i++) {
        await service.createApiTokenWithProjects({
            tokenName: `token-${i}`,
            type: api_token_1.ApiTokenType.CLIENT,
            environment: 'production',
            projects: ['*'],
        }, {
            id: 1,
            username: 'audit user',
            ip: '127.0.0.1',
        });
    }
});
test.each([api_token_1.ApiTokenType.ADMIN, api_token_1.ApiTokenType.CLIENT, api_token_1.ApiTokenType.FRONTEND])("Should prevent you from creating %s tokens when you're already at the limit", async (tokenType) => {
    const limit = 1;
    const service = createServiceWithLimit(limit);
    const auditUser = {
        id: 1,
        username: 'audit user',
        ip: '127.0.0.1',
    };
    await service.createApiTokenWithProjects({
        tokenName: 'token-1',
        type: api_token_1.ApiTokenType.CLIENT,
        environment: 'production',
        projects: ['*'],
    }, auditUser);
    const environment = tokenType === api_token_1.ApiTokenType.ADMIN ? '*' : 'production';
    await expect(service.createApiTokenWithProjects({
        tokenName: 'exceeds-limit',
        type: tokenType,
        environment,
        projects: ['*'],
    }, auditUser)).rejects.toThrow(exceeds_limit_error_1.ExceedsLimitError);
});
//# sourceMappingURL=api-token-service.limit.test.js.map