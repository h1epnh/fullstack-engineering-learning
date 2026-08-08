"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patsSchema = void 0;
const pat_schema_1 = require("./pat-schema");
exports.patsSchema = {
    $id: '#/components/schemas/patsSchema',
    type: 'object',
    description: 'Contains a collection of [personal access tokens](https://docs.getunleash.io/reference/api-tokens-and-client-keys#personal-access-tokens), or PATs. PATs are automatically scoped to the authenticated user.',
    properties: {
        pats: {
            type: 'array',
            description: 'A collection of PATs.',
            items: {
                $ref: pat_schema_1.patSchema.$id,
            },
        },
    },
    components: {
        schemas: {
            patSchema: pat_schema_1.patSchema,
        },
    },
};
//# sourceMappingURL=pats-schema.js.map