import type { FromSchema } from 'json-schema-to-ts';
export declare const createContextFieldSchema: {
    readonly $id: "#/components/schemas/createContextFieldSchema";
    readonly description: "Data used to create a context field configuration.";
    readonly required: readonly ["name"];
    readonly properties: {
        readonly name: {
            readonly description: "The name of the context field.";
            readonly type: "string";
            readonly example: "subscriptionTier";
        };
        readonly description: {
            readonly type: "string";
            readonly description: "A description of the context field";
            readonly example: "The user's subscription tier";
        };
        readonly stickiness: {
            readonly type: "boolean";
            readonly description: "`true` if this field should be available for use with [custom stickiness](https://docs.getunleash.io/reference/stickiness#custom-stickiness), otherwise `false`";
            readonly example: false;
        };
        readonly sortOrder: {
            readonly type: "integer";
            readonly description: "How this context field should be sorted if no other sort order is selected";
            readonly example: 2;
        };
        readonly legalValues: {
            readonly type: "array";
            readonly description: "A list of allowed values for this context field";
            readonly example: readonly [{
                readonly value: "gold";
            }, {
                readonly value: "silver";
            }, {
                readonly value: "crystal";
            }];
            readonly items: {
                readonly $ref: "#/components/schemas/legalValueSchema";
            };
        };
    };
    readonly type: "object";
    readonly components: {
        readonly schemas: {
            readonly legalValueSchema: {
                readonly $id: "#/components/schemas/legalValueSchema";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly description: "Describes a legal value. Typically used to limit possible values for contextFields or strategy properties";
                readonly required: readonly ["value"];
                readonly properties: {
                    readonly value: {
                        readonly description: "The valid value";
                        readonly type: "string";
                        readonly example: "#c154c1";
                    };
                    readonly description: {
                        readonly description: "Describes this specific legal value";
                        readonly type: "string";
                        readonly example: "Deep fuchsia";
                    };
                };
                readonly components: {};
            };
        };
    };
};
export type CreateContextFieldSchema = FromSchema<typeof createContextFieldSchema>;
//# sourceMappingURL=create-context-field-schema.d.ts.map