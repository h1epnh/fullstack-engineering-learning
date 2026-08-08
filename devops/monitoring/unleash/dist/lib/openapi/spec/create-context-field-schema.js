"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContextFieldSchema = void 0;
const update_context_field_schema_1 = require("./update-context-field-schema");
exports.createContextFieldSchema = {
    ...update_context_field_schema_1.updateContextFieldSchema,
    $id: '#/components/schemas/createContextFieldSchema',
    description: 'Data used to create a context field configuration.',
    required: ['name'],
    properties: {
        ...update_context_field_schema_1.updateContextFieldSchema.properties,
        name: {
            description: 'The name of the context field.',
            type: 'string',
            example: 'subscriptionTier',
        },
    },
};
//# sourceMappingURL=create-context-field-schema.js.map