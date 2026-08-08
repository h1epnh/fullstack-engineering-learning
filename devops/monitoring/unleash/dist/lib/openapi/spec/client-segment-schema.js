"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientSegmentSchema = void 0;
const constraint_schema_1 = require("./constraint-schema");
exports.clientSegmentSchema = {
    $id: '#/components/schemas/clientSegmentSchema',
    type: 'object',
    description: 'Represents a client API segment of users defined by a set of constraints.',
    additionalProperties: false,
    required: ['id', 'constraints'],
    properties: {
        id: {
            type: 'number',
            description: "The segment's id.",
        },
        name: {
            type: 'string',
            description: 'The name of the segment.',
            example: 'segment A',
        },
        constraints: {
            type: 'array',
            description: 'List of constraints that determine which users are part of the segment',
            items: {
                $ref: '#/components/schemas/constraintSchema',
            },
        },
    },
    components: {
        schemas: {
            constraintSchema: constraint_schema_1.constraintSchema,
        },
    },
};
//# sourceMappingURL=client-segment-schema.js.map