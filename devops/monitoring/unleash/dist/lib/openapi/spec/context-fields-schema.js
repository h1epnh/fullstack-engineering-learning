"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextFieldsSchema = void 0;
const context_field_schema_1 = require("./context-field-schema");
const legal_value_schema_1 = require("./legal-value-schema");
exports.contextFieldsSchema = {
    $id: '#/components/schemas/contextFieldsSchema',
    type: 'array',
    description: 'A list of context fields',
    items: {
        $ref: '#/components/schemas/contextFieldSchema',
    },
    components: {
        schemas: {
            contextFieldSchema: context_field_schema_1.contextFieldSchema,
            legalValueSchema: legal_value_schema_1.legalValueSchema,
        },
    },
};
//# sourceMappingURL=context-fields-schema.js.map