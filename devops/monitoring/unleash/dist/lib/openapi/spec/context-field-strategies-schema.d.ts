import type { FromSchema } from 'json-schema-to-ts';
export declare const contextFieldStrategiesSchema: {
    readonly $id: "#/components/schemas/contextFieldStrategiesSchema";
    readonly type: "object";
    readonly description: "A wrapper object containing all strategies that use a specific context field";
    readonly required: readonly ["strategies"];
    readonly properties: {
        readonly strategies: {
            readonly type: "array";
            readonly description: "List of strategies using the context field";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["id", "featureName", "projectId", "environment", "strategyName"];
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                        readonly example: "433ae8d9-dd69-4ad0-bc46-414aedbe9c55";
                        readonly description: "The ID of the strategy.";
                    };
                    readonly featureName: {
                        readonly type: "string";
                        readonly example: "best-feature";
                        readonly description: "The name of the feature that contains this strategy.";
                    };
                    readonly projectId: {
                        readonly type: "string";
                        readonly description: "The ID of the project that contains this feature.";
                    };
                    readonly environment: {
                        readonly type: "string";
                        readonly description: "The ID of the environment where this strategy is in.";
                    };
                    readonly strategyName: {
                        readonly type: "string";
                        readonly description: "The name of the strategy.";
                    };
                };
            };
        };
    };
    readonly components: {};
};
export type ContextFieldStrategiesSchema = FromSchema<typeof contextFieldStrategiesSchema>;
//# sourceMappingURL=context-field-strategies-schema.d.ts.map