import type { FromSchema } from 'json-schema-to-ts';
export declare const healthCheckSchema: {
    readonly $id: "#/components/schemas/healthCheckSchema";
    readonly type: "object";
    readonly description: "Used by service orchestrators to decide whether this Unleash instance should be marked as healthy or unhealthy";
    readonly additionalProperties: false;
    readonly required: readonly ["health"];
    readonly properties: {
        readonly health: {
            readonly description: "The state this Unleash instance is in. GOOD if everything is ok, BAD if the instance should be restarted";
            readonly type: "string";
            readonly enum: readonly ["GOOD", "BAD"];
            readonly example: "GOOD";
        };
    };
    readonly components: {};
};
export type HealthCheckSchema = FromSchema<typeof healthCheckSchema>;
//# sourceMappingURL=health-check-schema.d.ts.map