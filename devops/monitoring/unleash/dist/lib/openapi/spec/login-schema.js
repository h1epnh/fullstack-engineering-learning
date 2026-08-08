"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = void 0;
exports.loginSchema = {
    $id: '#/components/schemas/loginSchema',
    type: 'object',
    additionalProperties: false,
    required: ['username', 'password'],
    description: 'A username/password login request',
    properties: {
        username: {
            description: 'The username trying to log in',
            type: 'string',
            example: 'user',
        },
        password: {
            description: 'The password of the user trying to log in',
            type: 'string',
            example: 'hunter2',
        },
    },
    components: {},
};
//# sourceMappingURL=login-schema.js.map