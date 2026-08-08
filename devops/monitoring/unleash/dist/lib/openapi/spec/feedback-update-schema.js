"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedbackUpdateSchema = void 0;
exports.feedbackUpdateSchema = {
    $id: '#/components/schemas/feedbackUpdateSchema',
    type: 'object',
    description: 'User feedback information to be updated.',
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
    },
    components: {},
};
//# sourceMappingURL=feedback-update-schema.js.map