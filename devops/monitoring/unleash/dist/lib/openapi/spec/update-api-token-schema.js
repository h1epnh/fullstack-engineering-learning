"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApiTokenSchema = void 0;
exports.updateApiTokenSchema = {
    $id: '#/components/schemas/updateApiTokenSchema',
    type: 'object',
    required: ['expiresAt'],
    description: 'An object with fields to updated for a given API token.',
    properties: {
        expiresAt: {
            description: 'The new time when this token should expire.',
            example: '2023-09-04T11:26:24+02:00',
            type: 'string',
            format: 'date-time',
        },
    },
    components: {},
};
//# sourceMappingURL=update-api-token-schema.js.map