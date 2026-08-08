"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiTokensSchema = void 0;
const api_token_schema_1 = require("./api-token-schema");
exports.apiTokensSchema = {
    $id: '#/components/schemas/apiTokensSchema',
    type: 'object',
    description: 'An object with [Unleash API tokens](https://docs.getunleash.io/reference/api-tokens-and-client-keys)',
    additionalProperties: false,
    required: ['tokens'],
    properties: {
        tokens: {
            type: 'array',
            description: 'A list of Unleash API tokens.',
            items: {
                $ref: '#/components/schemas/apiTokenSchema',
            },
        },
    },
    components: {
        schemas: {
            apiTokenSchema: api_token_schema_1.apiTokenSchema,
        },
    },
};
//# sourceMappingURL=api-tokens-schema.js.map