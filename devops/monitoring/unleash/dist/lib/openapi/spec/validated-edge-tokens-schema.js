"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatedEdgeTokensSchema = void 0;
const edge_token_schema_1 = require("./edge-token-schema");
exports.validatedEdgeTokensSchema = {
    $id: '#/components/schemas/validatedEdgeTokensSchema',
    type: 'object',
    additionalProperties: false,
    required: ['tokens'],
    description: `A object containing a list of valid Unleash tokens.`,
    properties: {
        tokens: {
            description: 'The list of Unleash token objects. Each object contains the token itself and some additional metadata.',
            type: 'array',
            items: { $ref: '#/components/schemas/edgeTokenSchema' },
        },
    },
    components: {
        schemas: {
            edgeTokenSchema: edge_token_schema_1.edgeTokenSchema,
        },
    },
};
//# sourceMappingURL=validated-edge-tokens-schema.js.map