"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedbackResponseSchema = void 0;
exports.feedbackResponseSchema = {
    $id: '#/components/schemas/feedbackResponseSchema',
    additionalProperties: false,
    type: 'object',
    description: 'User feedback information about a particular feedback item.',
    properties: {
        userId: {
            description: 'The ID of the user that gave the feedback.',
            type: 'integer',
            example: 2,
        },
        neverShow: {
            description: '`true` if the user has asked never to see this feedback questionnaire again.',
            type: 'boolean',
            example: false,
        },
        given: {
            description: 'When this feedback was given',
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-07-06T08:29:21.282Z',
        },
        feedbackId: {
            description: 'The name of the feedback session',
            type: 'string',
            example: 'pnps',
        },
    },
    components: {},
};
//# sourceMappingURL=feedback-response-schema.js.map