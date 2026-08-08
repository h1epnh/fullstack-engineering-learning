import type { FromSchema } from 'json-schema-to-ts';
export declare const variantSchema: {
    readonly $id: "#/components/schemas/variantSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly description: "A variant allows for further separation of users into segments. See [our excellent documentation](https://docs.getunleash.io/reference/feature-toggle-variants#what-are-variants) for a more detailed description";
    readonly required: readonly ["name", "weight"];
    readonly properties: {
        readonly name: {
            readonly type: "string";
            readonly description: "The variants name. Is unique for this feature flag";
            readonly example: "blue_group";
        };
        readonly weight: {
            readonly type: "number";
            readonly description: "The weight is the likelihood of any one user getting this variant. It is a number between 0 and 1000. See the section on [variant weights](https://docs.getunleash.io/reference/feature-toggle-variants#variant-weight) for more information";
            readonly minimum: 0;
            readonly maximum: 1000;
        };
        readonly weightType: {
            readonly description: "Set to fix if this variant must have exactly the weight allocated to it. If the type is variable, the weight will adjust so that the total weight of all variants adds up to 1000";
            readonly type: "string";
            readonly example: "variable";
            readonly enum: readonly ["variable", "fix"];
        };
        readonly stickiness: {
            readonly type: "string";
            readonly description: "[Stickiness](https://docs.getunleash.io/reference/feature-toggle-variants#variant-stickiness) is how Unleash guarantees that the same user gets the same variant every time";
            readonly example: "custom.context.field";
        };
        readonly payload: {
            readonly type: "object";
            readonly required: readonly ["type", "value"];
            readonly description: "Extra data configured for this variant";
            readonly additionalProperties: false;
            readonly properties: {
                readonly type: {
                    readonly description: "The type of the value. Commonly used types are string, number, json and csv.";
                    readonly type: "string";
                    readonly enum: readonly ["json", "csv", "string", "number"];
                };
                readonly value: {
                    readonly description: "The actual value of payload";
                    readonly type: "string";
                };
            };
            readonly example: {
                readonly type: "json";
                readonly value: "{\"color\": \"red\"}";
            };
        };
        readonly overrides: {
            readonly description: "Overrides assigning specific variants to specific users. The weighting system automatically assigns users to specific groups for you, but any overrides in this list will take precedence.";
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/components/schemas/overrideSchema";
            };
        };
    };
    readonly components: {
        readonly schemas: {
            readonly overrideSchema: {
                readonly $id: "#/components/schemas/overrideSchema";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["contextName", "values"];
                readonly description: "An override for deciding which variant should be assigned to a user based on the context name";
                readonly properties: {
                    readonly contextName: {
                        readonly description: "The name of the context field used to determine overrides";
                        readonly type: "string";
                        readonly example: "userId";
                    };
                    readonly values: {
                        readonly description: "Which values that should be overriden";
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                        readonly example: readonly ["red", "blue"];
                    };
                };
                readonly components: {};
            };
        };
    };
};
export type VariantSchema = FromSchema<typeof variantSchema>;
//# sourceMappingURL=variant-schema.d.ts.map