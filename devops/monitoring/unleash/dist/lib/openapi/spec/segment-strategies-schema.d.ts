import type { FromSchema } from 'json-schema-to-ts';
export declare const segmentStrategiesSchema: {
    readonly $id: "#/components/schemas/segmentStrategiesSchema";
    readonly type: "object";
    readonly required: readonly ["strategies"];
    readonly description: "A collection of strategies belonging to a specified segment.";
    readonly additionalProperties: false;
    readonly properties: {
        readonly strategies: {
            readonly description: "The list of strategies";
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["id", "featureName", "projectId", "environment", "strategyName"];
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                        readonly description: "The ID of the strategy";
                        readonly example: "e465c813-cffb-4232-b184-82b1d6fe9d3d";
                    };
                    readonly featureName: {
                        readonly type: "string";
                        readonly description: "The name of the feature flag that this strategy belongs to.";
                        readonly example: "new-signup-flow";
                    };
                    readonly projectId: {
                        readonly type: "string";
                        readonly description: "The ID of the project that the strategy belongs to.";
                        readonly example: "red-vista";
                    };
                    readonly environment: {
                        readonly type: "string";
                        readonly description: "The ID of the environment that the strategy belongs to.";
                        readonly example: "development";
                    };
                    readonly strategyName: {
                        readonly type: "string";
                        readonly description: "The name of the strategy's type.";
                        readonly example: "flexibleRollout";
                    };
                };
            };
        };
        readonly changeRequestStrategies: {
            readonly description: "A list of strategies that use this segment in active change requests.";
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["featureName", "projectId", "environment", "strategyName"];
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                        readonly description: "The ID of the strategy. Not present on new strategies that haven't been added to the feature flag yet.";
                        readonly example: "e465c813-cffb-4232-b184-82b1d6fe9d3d";
                    };
                    readonly featureName: {
                        readonly type: "string";
                        readonly description: "The name of the feature flag that this strategy belongs to.";
                        readonly example: "new-signup-flow";
                    };
                    readonly projectId: {
                        readonly type: "string";
                        readonly description: "The ID of the project that the strategy belongs to.";
                        readonly example: "red-vista";
                    };
                    readonly environment: {
                        readonly type: "string";
                        readonly description: "The ID of the environment that the strategy belongs to.";
                        readonly example: "development";
                    };
                    readonly strategyName: {
                        readonly type: "string";
                        readonly description: "The name of the strategy's type.";
                        readonly example: "flexibleRollout";
                    };
                };
            };
        };
    };
    readonly components: {};
};
export type SegmentStrategiesSchema = FromSchema<typeof segmentStrategiesSchema>;
//# sourceMappingURL=segment-strategies-schema.d.ts.map