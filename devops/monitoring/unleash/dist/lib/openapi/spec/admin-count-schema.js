"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminCountSchema = void 0;
exports.adminCountSchema = {
    $id: '#/components/schemas/adminCountSchema',
    type: 'object',
    additionalProperties: false,
    description: 'Contains total admin counts for an Unleash instance.',
    required: ['password', 'noPassword', 'service'],
    properties: {
        password: {
            type: 'number',
            description: 'Total number of admins that have a password set.',
        },
        noPassword: {
            type: 'number',
            description: 'Total number of admins that do not have a password set. May be SSO, but may also be users that did not set a password yet.',
        },
        service: {
            type: 'number',
            description: 'Total number of service accounts that have the admin root role.',
        },
    },
    components: {},
};
//# sourceMappingURL=admin-count-schema.js.map