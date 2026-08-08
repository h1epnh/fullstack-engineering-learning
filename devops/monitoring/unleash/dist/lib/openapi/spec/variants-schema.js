"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.variantsSchema = void 0;
const variant_schema_1 = require("./variant-schema");
const override_schema_1 = require("./override-schema");
exports.variantsSchema = {
    $id: '#/components/schemas/variantsSchema',
    type: 'array',
    description: 'A list of variants',
    items: {
        $ref: '#/components/schemas/variantSchema',
    },
    components: {
        schemas: {
            variantSchema: variant_schema_1.variantSchema,
            overrideSchema: override_schema_1.overrideSchema,
        },
    },
};
//# sourceMappingURL=variants-schema.js.map