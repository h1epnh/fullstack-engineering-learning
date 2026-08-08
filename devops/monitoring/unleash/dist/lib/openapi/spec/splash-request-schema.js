"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splashRequestSchema = void 0;
exports.splashRequestSchema = {
    $id: '#/components/schemas/splashRequestSchema',
    type: 'object',
    description: 'Data related to a user having seen a splash screen.',
    required: ['userId', 'splashId'],
    properties: {
        userId: {
            type: 'integer',
            description: 'The ID of the user that was shown the splash screen.',
            example: 1,
        },
        splashId: {
            type: 'string',
            description: 'The ID of the splash screen that was shown.',
            example: 'new-splash-screen',
        },
    },
    components: {},
};
//# sourceMappingURL=splash-request-schema.js.map