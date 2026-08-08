"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = void 0;
exports.resetPasswordSchema = {
    $id: '#/components/schemas/resetPasswordSchema',
    type: 'object',
    description: 'Data used to provide users a way to reset their passwords.',
    additionalProperties: false,
    required: ['resetPasswordUrl'],
    properties: {
        resetPasswordUrl: {
            description: 'A URL pointing to a location where the user can reset their password',
            type: 'string',
            format: 'uri',
            example: 'https://unleash.reset.com',
        },
    },
    components: {},
};
//# sourceMappingURL=reset-password-schema.js.map