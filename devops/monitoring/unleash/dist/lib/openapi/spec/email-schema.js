"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailSchema = void 0;
exports.emailSchema = {
    $id: '#/components/schemas/emailSchema',
    type: 'object',
    additionalProperties: false,
    required: ['email'],
    description: 'Represents the email of a user. Used to send email communication (reset password, welcome mail etc)',
    properties: {
        email: {
            description: 'The email address',
            type: 'string',
            example: 'test@example.com',
        },
    },
    components: {},
};
//# sourceMappingURL=email-schema.js.map