"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureLifecycleCompletedSchema = void 0;
exports.featureLifecycleCompletedSchema = {
    $id: '#/components/schemas/featureLifecycleCompletedSchema',
    description: 'A feature that has been marked as completed',
    additionalProperties: false,
    type: 'object',
    required: ['status'],
    properties: {
        status: {
            type: 'string',
            enum: ['kept', 'discarded'],
            example: 'kept',
            description: 'The status of the feature after it has been marked as completed',
        },
        statusValue: {
            type: 'string',
            example: 'variant1',
            description: 'The metadata value passed in together with status',
        },
    },
    components: {
        schemas: {},
    },
};
//# sourceMappingURL=feature-lifecycle-completed-schema.js.map