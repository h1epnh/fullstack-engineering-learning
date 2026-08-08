import type { FromSchema } from 'json-schema-to-ts';
export declare const strategySchema: {
    readonly $id: "#/components/schemas/strategySchema";
    readonly description: "The [activation strategy](https://docs.getunleash.io/reference/activation-strategies) schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["name", "displayName", "description", "editable", "deprecated", "parameters"];
    readonly properties: {
        readonly title: {
            readonly type: "string";
            readonly nullable: true;
            readonly description: "An optional title for the strategy";
            readonly example: "GradualRollout - Prod25";
        };
        readonly name: {
            readonly type: "string";
            readonly description: "The name (type) of the strategy";
            readonly example: "flexibleRollout";
        };
        readonly displayName: {
            readonly type: "string";
            readonly description: "A human friendly name for the strategy";
            readonly example: "Gradual Rollout";
            readonly nullable: true;
        };
        readonly description: {
            readonly type: "string";
            readonly nullable: true;
            readonly description: "A short description of the strategy";
            readonly example: "Gradual rollout to logged in users";
        };
        readonly editable: {
            readonly type: "boolean";
            readonly description: "Whether the strategy can be edited or not. Strategies bundled with Unleash cannot be edited.";
            readonly example: true;
        };
        readonly deprecated: {
            readonly type: "boolean";
            readonly description: "";
            readonly example: true;
        };
        readonly parameters: {
            readonly type: "array";
            readonly description: "A list of relevant parameters for each strategy";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly properties: {
                    readonly name: {
                        readonly type: "string";
                        readonly example: "percentage";
                    };
                    readonly type: {
                        readonly type: "string";
                        readonly example: "percentage";
                    };
                    readonly description: {
                        readonly type: "string";
                        readonly example: "Gradual rollout to logged in users";
                    };
                    readonly required: {
                        readonly type: "boolean";
                        readonly example: true;
                    };
                };
            };
        };
    };
    readonly components: {};
};
export type StrategySchema = FromSchema<typeof strategySchema>;
//# sourceMappingURL=strategy-schema.d.ts.map