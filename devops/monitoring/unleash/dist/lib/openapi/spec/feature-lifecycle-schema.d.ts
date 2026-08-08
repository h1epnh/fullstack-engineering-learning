import type { FromSchema } from 'json-schema-to-ts';
export declare const featureLifecycleSchema: {
    readonly $id: "#/components/schemas/featureLifecycleSchema";
    readonly type: "array";
    readonly description: "A list of lifecycle stages for a given feature";
    readonly items: {
        readonly additionalProperties: false;
        readonly type: "object";
        readonly required: readonly ["stage", "enteredStageAt"];
        readonly properties: {
            readonly stage: {
                readonly type: "string";
                readonly enum: readonly ["initial", "pre-live", "live", "completed", "archived"];
                readonly example: "initial";
                readonly description: "The name of the lifecycle stage that got recorded for a given feature";
            };
            readonly status: {
                readonly type: "string";
                readonly example: "kept";
                readonly description: "The name of the detailed status of a given stage. E.g. completed stage can be kept or discarded.";
            };
            readonly enteredStageAt: {
                readonly type: "string";
                readonly format: "date-time";
                readonly example: "2023-01-28T16:21:39.975Z";
                readonly description: "The date when the feature entered a given stage";
            };
        };
        readonly description: "The lifecycle stage of the feature";
    };
    readonly components: {
        readonly schemas: {};
    };
};
export type FeatureLifecycleSchema = FromSchema<typeof featureLifecycleSchema>;
//# sourceMappingURL=feature-lifecycle-schema.d.ts.map