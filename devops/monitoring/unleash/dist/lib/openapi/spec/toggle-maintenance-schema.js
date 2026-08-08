"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleMaintenanceSchema = void 0;
exports.toggleMaintenanceSchema = {
    $id: '#/components/schemas/toggleMaintenanceSchema',
    type: 'object',
    description: 'Data used when to activate or deactivate maintenance mode for Unleash.',
    required: ['enabled'],
    properties: {
        enabled: {
            description: '`true` if you want to activate maintenance mode, `false` if you want to deactivate it.',
            type: 'boolean',
            example: true,
        },
    },
    components: {},
};
//# sourceMappingURL=toggle-maintenance-schema.js.map