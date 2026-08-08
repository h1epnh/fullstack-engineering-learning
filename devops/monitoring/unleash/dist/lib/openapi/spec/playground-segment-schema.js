"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playgroundSegmentSchema = void 0;
const playground_constraint_schema_1 = require("./playground-constraint-schema");
exports.playgroundSegmentSchema = {
    $id: '#/components/schemas/playgroundSegmentSchema',
    type: 'object',
    additionalProperties: false,
    description: 'The evaluated result of a segment as used by the Playground.',
    required: ['name', 'id', 'constraints', 'result'],
    properties: {
        id: {
            description: "The segment's id.",
            type: 'integer',
        },
        name: {
            description: 'The name of the segment.',
            example: 'segment A',
            type: 'string',
        },
        result: {
            description: 'Whether this was evaluated as true or false.',
            type: 'boolean',
        },
        constraints: {
            type: 'array',
            description: 'The list of constraints in this segment.',
            items: { $ref: playground_constraint_schema_1.playgroundConstraintSchema.$id },
        },
    },
    components: {
        schemas: {
            playgroundConstraintSchema: playground_constraint_schema_1.playgroundConstraintSchema,
        },
    },
};
//# sourceMappingURL=playground-segment-schema.js.map