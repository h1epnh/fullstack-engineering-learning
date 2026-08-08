import type { FromSchema } from 'json-schema-to-ts';
export declare const maintenanceSchema: {
    readonly $id: "#/components/schemas/maintenanceSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly description: "The current state of Unleash's maintenance mode feature.";
    readonly required: readonly ["enabled"];
    readonly properties: {
        readonly enabled: {
            readonly description: "Whether maintenance mode is enabled or not.";
            readonly type: "boolean";
            readonly example: true;
        };
    };
    readonly components: {};
};
export type MaintenanceSchema = FromSchema<typeof maintenanceSchema>;
//# sourceMappingURL=maintenance-schema.d.ts.map