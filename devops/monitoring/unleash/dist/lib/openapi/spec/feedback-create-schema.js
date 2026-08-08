"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedbackCreateSchema = void 0;
exports.feedbackCreateSchema = {
    $id: '#/components/schemas/feedbackCreateSchema',
    required: ['feedbackId'],
    type: 'object',
    description: 'User feedback information to be created.',
    properties: {
        neverShow: {
            description: '`true` if the user has asked never to see this feedback questionnaire again. Defaults to `false`.',
            type: 'boolean',
            example: false,
        },
        feedbackId: {
            description: 'The name of the feedback session',
            type: 'string',
            example: 'pnps',
        },
    },
    components: {},
};
//# sourceMappingURL=feedback-create-schema.js.map