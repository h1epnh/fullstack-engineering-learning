import type { FromSchema } from 'json-schema-to-ts';
export declare const telemetrySettingsSchema: {
    readonly $id: "#/components/schemas/telemetrySettingsSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["versionInfoCollectionEnabled", "featureInfoCollectionEnabled"];
    readonly description: "Contains information about which settings are configured for version info collection and feature usage collection.";
    readonly properties: {
        readonly versionInfoCollectionEnabled: {
            readonly type: "boolean";
            readonly description: "Whether collection of version info is enabled/active.";
            readonly example: true;
        };
        readonly featureInfoCollectionEnabled: {
            readonly type: "boolean";
            readonly description: "Whether collection of feature usage metrics is enabled/active.";
            readonly example: true;
        };
    };
    readonly components: {};
};
export type TelemetrySettingsSchema = FromSchema<typeof telemetrySettingsSchema>;
//# sourceMappingURL=telemetry-settings-schema.d.ts.map