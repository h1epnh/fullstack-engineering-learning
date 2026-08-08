"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintenanceSchema = void 0;
exports.maintenanceSchema = {
    $id: '#/components/schemas/maintenanceSchema',
    type: 'object',
    additionalProperties: false,
    description: "The current state of Unleash's maintenance mode feature.",
    required: ['enabled'],
    properties: {
        enabled: {
            description: 'Whether maintenance mode is enabled or not.',
            type: 'boolean',
            example: true,
        },
    },
    components: {},
};
//# sourceMappingURL=maintenance-schema.js.map