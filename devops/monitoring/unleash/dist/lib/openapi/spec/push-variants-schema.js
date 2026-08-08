"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushVariantsSchema = void 0;
const variant_schema_1 = require("./variant-schema");
const override_schema_1 = require("./override-schema");
exports.pushVariantsSchema = {
    $id: '#/components/schemas/pushVariantsSchema',
    type: 'object',
    description: 'Data used when copying variants into a new environment.',
    properties: {
        variants: {
            type: 'array',
            description: 'The variants to write to the provided environments',
            items: {
                $ref: '#/components/schemas/variantSchema',
            },
        },
        environments: {
            type: 'array',
            description: 'The enviromnents to write the provided variants to',
            items: {
                type: 'string',
            },
        },
    },
    components: {
        schemas: {
            variantSchema: variant_schema_1.variantSchema,
            overrideSchema: override_schema_1.overrideSchema,
        },
    },
};
//# sourceMappingURL=push-variants-schema.js.map