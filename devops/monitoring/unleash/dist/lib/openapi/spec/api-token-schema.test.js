"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_token_1 = require("../../types/models/api-token");
const validate_1 = require("../validate");
const defaultData = {
    secret: '',
    username: '',
    tokenName: '',
    type: api_token_1.ApiTokenType.CLIENT,
    environment: '',
    projects: [],
    expiresAt: '2022-01-01T00:00:00.000Z',
    createdAt: '2022-01-01T00:00:00.000Z',
    seenAt: '2022-01-01T00:00:00.000Z',
    project: '',
};
test('apiTokenSchema', () => {
    const data = { ...defaultData };
    expect((0, validate_1.validateSchema)('#/components/schemas/apiTokenSchema', data)).toBeUndefined();
});
test('apiTokenSchema empty', () => {
    expect((0, validate_1.validateSchema)('#/components/schemas/apiTokenSchema', {})).toMatchSnapshot();
});
//# sourceMappingURL=api-token-schema.test.js.map