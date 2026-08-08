"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureStrategySegmentSchema = void 0;
exports.featureStrategySegmentSchema = {
    $id: '#/components/schemas/featureStrategySegmentSchema',
    type: 'object',
    description: 'An object containing a segment identifier and a strategy identifier.',
    additionalProperties: false,
    required: ['segmentId', 'featureStrategyId'],
    properties: {
        segmentId: {
            type: 'integer',
            description: 'The ID of the segment',
            example: 2,
        },
        featureStrategyId: {
            type: 'string',
            description: 'The ID of the strategy',
            example: 'e2caa08f-30c4-4aa3-b955-54ca9e93dc13',
        },
    },
    components: {},
};
//# sourceMappingURL=feature-strategy-segment-schema.js.map