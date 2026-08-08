"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUiConfigSchema = void 0;
exports.setUiConfigSchema = {
    $id: '#/components/schemas/setUiConfigSchema',
    type: 'object',
    additionalProperties: false,
    description: 'Unleash configuration settings affect the admin UI.',
    properties: {
        frontendSettings: {
            type: 'object',
            description: 'Settings related to the front-end API.',
            additionalProperties: false,
            required: ['frontendApiOrigins'],
            properties: {
                frontendApiOrigins: {
                    description: 'The list of origins that the front-end API should accept requests from.',
                    example: ['*'],
                    type: 'array',
                    items: { type: 'string' },
                },
            },
        },
    },
    components: {},
};
//# sourceMappingURL=set-ui-config-schema.js.map