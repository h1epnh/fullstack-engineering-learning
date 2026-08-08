import type { FromSchema } from 'json-schema-to-ts';
export declare const featureLifecycleCompletedSchema: {
    readonly $id: "#/components/schemas/featureLifecycleCompletedSchema";
    readonly description: "A feature that has been marked as completed";
    readonly additionalProperties: false;
    readonly type: "object";
    readonly required: readonly ["status"];
    readonly properties: {
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["kept", "discarded"];
            readonly example: "kept";
            readonly description: "The status of the feature after it has been marked as completed";
        };
        readonly statusValue: {
            readonly type: "string";
            readonly example: "variant1";
            readonly description: "The metadata value passed in together with status";
        };
    };
    readonly components: {
        readonly schemas: {};
    };
};
export type FeatureLifecycleCompletedSchema = FromSchema<typeof featureLifecycleCompletedSchema>;
//# sourceMappingURL=feature-lifecycle-completed-schema.d.ts.map