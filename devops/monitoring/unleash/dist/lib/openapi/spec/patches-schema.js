"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchesSchema = void 0;
const patch_schema_1 = require("./patch-schema");
exports.patchesSchema = {
    $id: '#/components/schemas/patchesSchema',
    type: 'array',
    description: 'A list of patches',
    items: {
        $ref: '#/components/schemas/patchSchema',
    },
    components: {
        schemas: {
            patchSchema: patch_schema_1.patchSchema,
        },
    },
};
//# sourceMappingURL=patches-schema.js.map