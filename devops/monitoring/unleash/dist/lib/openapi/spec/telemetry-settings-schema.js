"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.telemetrySettingsSchema = void 0;
exports.telemetrySettingsSchema = {
    $id: '#/components/schemas/telemetrySettingsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['versionInfoCollectionEnabled', 'featureInfoCollectionEnabled'],
    description: 'Contains information about which settings are configured for version info collection and feature usage collection.',
    properties: {
        versionInfoCollectionEnabled: {
            type: 'boolean',
            description: 'Whether collection of version info is enabled/active.',
            example: true,
        },
        featureInfoCollectionEnabled: {
            type: 'boolean',
            description: 'Whether collection of feature usage metrics is enabled/active.',
            example: true,
        },
    },
    components: {},
};
//# sourceMappingURL=telemetry-settings-schema.js.map