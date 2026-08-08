"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.segmentsSchema = void 0;
const admin_segment_schema_1 = require("./admin-segment-schema");
const constraint_schema_1 = require("./constraint-schema");
exports.segmentsSchema = {
    $id: '#/components/schemas/segmentsSchema',
    description: 'Data containing a list of [segments](https://docs.getunleash.io/reference/segments)',
    type: 'object',
    properties: {
        segments: {
            type: 'array',
            description: 'A list of segments',
            items: {
                $ref: '#/components/schemas/adminSegmentSchema',
            },
        },
    },
    components: {
        schemas: {
            adminSegmentSchema: admin_segment_schema_1.adminSegmentSchema,
            constraintSchema: constraint_schema_1.constraintSchema,
        },
    },
};
//# sourceMappingURL=segments-schema.js.map