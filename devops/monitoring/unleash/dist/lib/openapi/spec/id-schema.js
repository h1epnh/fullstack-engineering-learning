"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idSchema = void 0;
exports.idSchema = {
    $id: '#/components/schemas/idSchema',
    type: 'object',
    additionalProperties: false,
    description: 'Email id used for password reset',
    required: ['id'],
    properties: {
        id: {
            type: 'string',
            description: 'User email',
            example: 'user@example.com',
        },
    },
    components: {},
};
//# sourceMappingURL=id-schema.js.map