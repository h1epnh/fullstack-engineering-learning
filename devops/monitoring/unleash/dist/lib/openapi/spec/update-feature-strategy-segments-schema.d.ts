import type { FromSchema } from 'json-schema-to-ts';
export declare const updateFeatureStrategySegmentsSchema: {
    readonly $id: "#/components/schemas/updateFeatureStrategySegmentsSchema";
    readonly type: "object";
    readonly required: readonly ["projectId", "strategyId", "environmentId", "segmentIds"];
    readonly description: "Data required to update segments for a strategy.";
    readonly properties: {
        readonly projectId: {
            readonly type: "string";
            readonly description: "The ID of the project that the strategy belongs to.";
            readonly example: "red-vista";
        };
        readonly strategyId: {
            readonly type: "string";
            readonly description: "The ID of the strategy to update segments for.";
            readonly example: "15d1e20b-6310-4e17-a0c2-9fb84de3053a";
        };
        readonly environmentId: {
            readonly type: "string";
            readonly description: "The ID of the strategy environment.";
            readonly example: "development";
        };
        readonly segmentIds: {
            readonly type: "array";
            readonly description: "The new list of segments (IDs) to use for this strategy. Any segments not in this list will be removed from the strategy.";
            readonly example: readonly [1, 5, 6];
            readonly items: {
                readonly type: "integer";
                readonly minimum: 0;
            };
        };
    };
    readonly components: {};
};
export type UpdateFeatureStrategySegmentsSchema = FromSchema<typeof updateFeatureStrategySegmentsSchema>;
//# sourceMappingURL=update-feature-strategy-segments-schema.d.ts.map