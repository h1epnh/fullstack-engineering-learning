import type { FromSchema } from 'json-schema-to-ts';
export declare const contextFieldSchema: {
    readonly $id: "#/components/schemas/contextFieldSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly description: "A representation of a [context field](https://docs.getunleash.io/reference/unleash-context).";
    readonly required: readonly ["name"];
    readonly properties: {
        readonly name: {
            readonly description: "The name of the context field";
            readonly type: "string";
            readonly example: "userId";
        };
        readonly description: {
            readonly description: "The description of the context field.";
            readonly type: "string";
            readonly nullable: true;
            readonly example: "Used to uniquely identify users";
        };
        readonly stickiness: {
            readonly description: "Does this context field support being used for [stickiness](https://docs.getunleash.io/reference/stickiness) calculations";
            readonly type: "boolean";
            readonly example: true;
        };
        readonly sortOrder: {
            readonly description: "Used when sorting a list of context fields. Is also used as a tiebreaker if a list of context fields is sorted alphabetically.";
            readonly type: "integer";
            readonly example: 900;
        };
        readonly createdAt: {
            readonly description: "When this context field was created";
            readonly type: "string";
            readonly format: "date-time";
            readonly nullable: true;
            readonly example: "2023-06-29T10:19:00.000Z";
        };
        readonly usedInFeatures: {
            readonly type: "integer";
            readonly description: "Number of projects where this context field is used in";
            readonly example: 3;
            readonly nullable: true;
            readonly minimum: 0;
        };
        readonly usedInProjects: {
            readonly type: "integer";
            readonly description: "Number of projects where this context field is used in";
            readonly example: 2;
            readonly nullable: true;
            readonly minimum: 0;
        };
        readonly legalValues: {
            readonly description: "Allowed values for this context field schema. Can be used to narrow down accepted input";
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/components/schemas/legalValueSchema";
            };
        };
    };
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
export type ContextFieldSchema = FromSchema<typeof contextFieldSchema>;
//# sourceMappingURL=context-field-schema.d.ts.map