import type { FromSchema } from 'json-schema-to-ts';
export declare const variantFlagSchema: {
    readonly $id: "#/components/schemas/variantFlagSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly description: "A representation of an evaluated Unleash feature variant.";
    readonly properties: {
        readonly name: {
            readonly description: "The name of the variant. Will always be disabled if `enabled` is false.";
            readonly example: "blue";
            readonly type: "string";
        };
        readonly enabled: {
            readonly type: "boolean";
            readonly description: "Whether the variant is enabled or not.";
            readonly example: true;
        };
        readonly payload: {
            readonly type: "object";
            readonly description: "Additional data associated with this variant.";
            readonly additionalProperties: false;
            readonly properties: {
                readonly type: {
                    readonly description: "The type of data contained.";
                    readonly type: "string";
                    readonly enum: readonly ["string", "json", "csv", "number"];
                    readonly example: "json";
                };
                readonly value: {
                    readonly description: "The actual associated data";
                    readonly type: "string";
                    readonly example: "{ \"starter\": \"squirtle\" }";
                };
            };
        };
        readonly feature_enabled: {
            readonly type: "boolean";
            readonly description: "Whether the feature is enabled or not.";
            readonly example: true;
        };
        readonly featureEnabled: {
            readonly deprecated: true;
            readonly type: "boolean";
            readonly description: "Use `feature_enabled` instead.";
            readonly example: true;
        };
    };
    readonly components: {};
};
export type VariantFlagSchema = FromSchema<typeof variantFlagSchema>;
//# sourceMappingURL=variant-flag-schema.d.ts.map