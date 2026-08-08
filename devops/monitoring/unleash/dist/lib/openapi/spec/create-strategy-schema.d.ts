import type { FromSchema } from 'json-schema-to-ts';
export declare const createStrategySchema: {
    readonly $id: "#/components/schemas/createStrategySchema";
    readonly type: "object";
    readonly description: "The data required to create a strategy type. Refer to the docs on [custom strategy types](https://docs.getunleash.io/reference/custom-activation-strategies) for more information.";
    readonly required: readonly ["name", "parameters"];
    readonly properties: {
        readonly name: {
            readonly type: "string";
            readonly description: "The name of the strategy type. Must be unique.";
            readonly example: "my-custom-strategy";
        };
        readonly title: {
            readonly type: "string";
            readonly description: "The title of the strategy";
            readonly example: "My awesome strategy";
        };
        readonly description: {
            readonly type: "string";
            readonly description: "A description of the strategy type.";
            readonly example: "Enable the feature for users who have not logged in before.";
        };
        readonly editable: {
            readonly type: "boolean";
            readonly description: "Whether the strategy type is editable or not. Defaults to `true`.";
            readonly example: false;
        };
        readonly deprecated: {
            readonly type: "boolean";
            readonly description: "Whether the strategy type is deprecated or not. Defaults to `false`.";
            readonly example: true;
        };
        readonly parameters: {
            readonly type: "array";
            readonly description: "The parameter list lets you pass arguments to your custom activation strategy. These will be made available to your custom strategy implementation.";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["name", "type"];
                readonly properties: {
                    readonly name: {
                        readonly type: "string";
                        readonly description: "The name of the parameter";
                        readonly example: "Rollout percentage";
                    };
                    readonly type: {
                        readonly type: "string";
                        readonly description: "The [type of the parameter](https://docs.getunleash.io/reference/custom-activation-strategies#parameter-types)";
                        readonly enum: readonly ["string", "percentage", "list", "number", "boolean"];
                        readonly example: "percentage";
                    };
                    readonly description: {
                        readonly type: "string";
                        readonly description: "A description of this strategy parameter. Use this to indicate to the users what the parameter does.";
                        readonly example: "How many percent of users should see this feature?";
                    };
                    readonly required: {
                        readonly type: "boolean";
                        readonly description: "Whether this parameter must be configured when using the strategy. Defaults to `false`";
                        readonly example: false;
                    };
                };
            };
        };
    };
    readonly components: {};
};
export type CreateStrategySchema = FromSchema<typeof createStrategySchema>;
//# sourceMappingURL=create-strategy-schema.d.ts.map