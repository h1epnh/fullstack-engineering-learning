"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPatSchema = void 0;
exports.createPatSchema = {
    $id: '#/components/schemas/createPatSchema',
    description: 'Describes the properties required to create a [personal access token](https://docs.getunleash.io/reference/api-tokens-and-client-keys#personal-access-tokens), or PAT. PATs are automatically scoped to the authenticated user.',
    type: 'object',
    required: ['description', 'expiresAt'],
    properties: {
        description: {
            type: 'string',
            description: `The PAT's description.`,
            example: 'user:xyzrandomstring',
        },
        expiresAt: {
            type: 'string',
            format: 'date-time',
            description: `The PAT's expiration date.`,
            example: '2023-04-19T08:15:14.000Z',
        },
    },
    components: {},
};
//# sourceMappingURL=create-pat-schema.js.map