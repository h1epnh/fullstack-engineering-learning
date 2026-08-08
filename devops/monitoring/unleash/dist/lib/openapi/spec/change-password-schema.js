"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = void 0;
exports.changePasswordSchema = {
    $id: '#/components/schemas/changePasswordSchema',
    type: 'object',
    additionalProperties: false,
    required: ['token', 'password'],
    description: 'Change password as long as the token is a valid token',
    properties: {
        token: {
            description: 'A reset token used to validate that the user is allowed to change the password.',
            type: 'string',
            example: '$2a$15$QzeW/y5/MEppCWVEkoX5euejobYOLSd4We21LQjjKlWH9l2I3wCke',
        },
        password: {
            type: 'string',
            description: 'The new password for the user',
            example: 'correct horse battery staple',
        },
    },
    components: {},
};
//# sourceMappingURL=change-password-schema.js.map