import type { FromSchema } from 'json-schema-to-ts';
export declare const featureStrategySegmentSchema: {
    readonly $id: "#/components/schemas/featureStrategySegmentSchema";
    readonly type: "object";
    readonly description: "An object containing a segment identifier and a strategy identifier.";
    readonly additionalProperties: false;
    readonly required: readonly ["segmentId", "featureStrategyId"];
    readonly properties: {
        readonly segmentId: {
            readonly type: "integer";
            readonly description: "The ID of the segment";
            readonly example: 2;
        };
        readonly featureStrategyId: {
            readonly type: "string";
            readonly description: "The ID of the strategy";
            readonly example: "e2caa08f-30c4-4aa3-b955-54ca9e93dc13";
        };
    };
    readonly components: {};
};
export type FeatureStrategySegmentSchema = FromSchema<typeof featureStrategySegmentSchema>;
//# sourceMappingURL=feature-strategy-segment-schema.d.ts.map