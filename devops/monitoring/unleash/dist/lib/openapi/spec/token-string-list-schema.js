"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenStringListSchema = void 0;
exports.tokenStringListSchema = {
    $id: '#/components/schemas/tokenStringListSchema',
    type: 'object',
    description: 'A list of unleash tokens to validate against known tokens',
    required: ['tokens'],
    properties: {
        tokens: {
            description: 'Tokens that we want to get access information about',
            type: 'array',
            items: { type: 'string' },
            example: [
                'aproject:development.randomstring',
                '[]:production.randomstring',
            ],
        },
    },
    components: {},
};
//# sourceMappingURL=token-string-list-schema.js.map