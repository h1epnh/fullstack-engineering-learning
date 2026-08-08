"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCorsSchema = void 0;
exports.setCorsSchema = {
    $id: '#/components/schemas/setCorsSchema',
    type: 'object',
    additionalProperties: false,
    description: 'Unleash CORS configuration.',
    properties: {
        frontendApiOrigins: {
            description: 'The list of origins that the front-end API should accept requests from.',
            example: ['*'],
            type: 'array',
            items: { type: 'string' },
        },
    },
    components: {},
};
//# sourceMappingURL=set-cors-schema.js.map