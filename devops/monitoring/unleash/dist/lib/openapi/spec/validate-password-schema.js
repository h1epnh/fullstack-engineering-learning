"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePasswordSchema = void 0;
exports.validatePasswordSchema = {
    $id: '#/components/schemas/validatePasswordSchema',
    type: 'object',
    additionalProperties: false,
    required: ['password'],
    description: 'Used to validate passwords obeying [Unleash password guidelines](https://docs.getunleash.io/reference/deploy/securing-unleash#password-requirements)',
    properties: {
        password: {
            description: 'The password to validate',
            type: 'string',
            example: 'hunter2',
        },
    },
    components: {},
};
//# sourceMappingURL=validate-password-schema.js.map