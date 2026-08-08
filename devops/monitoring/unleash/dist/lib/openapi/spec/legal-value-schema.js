"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.legalValueSchema = void 0;
exports.legalValueSchema = {
    $id: '#/components/schemas/legalValueSchema',
    type: 'object',
    additionalProperties: false,
    description: 'Describes a legal value. Typically used to limit possible values for contextFields or strategy properties',
    required: ['value'],
    properties: {
        value: {
            description: 'The valid value',
            type: 'string',
            example: '#c154c1',
        },
        description: {
            description: 'Describes this specific legal value',
            type: 'string',
            example: 'Deep fuchsia',
        },
    },
    components: {},
};
//# sourceMappingURL=legal-value-schema.js.map