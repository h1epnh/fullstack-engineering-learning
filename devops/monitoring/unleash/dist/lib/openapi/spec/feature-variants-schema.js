"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureVariantsSchema = void 0;
const variant_schema_1 = require("./variant-schema");
const override_schema_1 = require("./override-schema");
exports.featureVariantsSchema = {
    $id: '#/components/schemas/featureVariantsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'variants'],
    description: 'A versioned collection of feature flag variants.',
    properties: {
        version: {
            type: 'integer',
            example: 1,
            description: 'The version of the feature variants schema.',
        },
        variants: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/variantSchema',
            },
            description: 'All variants defined for a specific feature flag.',
        },
    },
    components: {
        schemas: {
            variantSchema: variant_schema_1.variantSchema,
            overrideSchema: override_schema_1.overrideSchema,
        },
    },
};
//# sourceMappingURL=feature-variants-schema.js.map