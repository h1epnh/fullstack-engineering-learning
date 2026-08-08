"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicSignupTokenCreateSchema = void 0;
exports.publicSignupTokenCreateSchema = {
    $id: '#/components/schemas/publicSignupTokenCreateSchema',
    type: 'object',
    description: 'Used for creating a [public invite link](https://docs.getunleash.io/reference/public-signup#public-sign-up-tokens)',
    additionalProperties: false,
    required: ['name', 'expiresAt'],
    properties: {
        name: {
            description: `The token's name.`,
            type: 'string',
        },
        expiresAt: {
            type: 'string',
            description: `The token's expiration date.`,
            format: 'date-time',
        },
    },
    components: {},
};
//# sourceMappingURL=public-signup-token-create-schema.js.map