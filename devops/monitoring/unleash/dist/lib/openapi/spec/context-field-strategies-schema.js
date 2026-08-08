"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextFieldStrategiesSchema = void 0;
exports.contextFieldStrategiesSchema = {
    $id: '#/components/schemas/contextFieldStrategiesSchema',
    type: 'object',
    description: 'A wrapper object containing all strategies that use a specific context field',
    required: ['strategies'],
    properties: {
        strategies: {
            type: 'array',
            description: 'List of strategies using the context field',
            items: {
                type: 'object',
                required: [
                    'id',
                    'featureName',
                    'projectId',
                    'environment',
                    'strategyName',
                ],
                properties: {
                    id: {
                        type: 'string',
                        example: '433ae8d9-dd69-4ad0-bc46-414aedbe9c55',
                        description: 'The ID of the strategy.',
                    },
                    featureName: {
                        type: 'string',
                        example: 'best-feature',
                        description: 'The name of the feature that contains this strategy.',
                    },
                    projectId: {
                        type: 'string',
                        description: 'The ID of the project that contains this feature.',
                    },
                    environment: {
                        type: 'string',
                        description: 'The ID of the environment where this strategy is in.',
                    },
                    strategyName: {
                        type: 'string',
                        description: 'The name of the strategy.',
                    },
                },
            },
        },
    },
    components: {},
};
//# sourceMappingURL=context-field-strategies-schema.js.map