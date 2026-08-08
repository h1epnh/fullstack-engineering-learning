"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nameSchema = void 0;
exports.nameSchema = {
    $id: '#/components/schemas/nameSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name'],
    description: 'An object with a name',
    properties: {
        name: {
            description: 'The name of the represented object.',
            example: 'betaUser',
            type: 'string',
        },
    },
    components: {},
};
//# sourceMappingURL=name-schema.js.map