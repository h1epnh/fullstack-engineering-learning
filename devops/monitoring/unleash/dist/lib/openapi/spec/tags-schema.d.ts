import type { FromSchema } from 'json-schema-to-ts';
export declare const tagsSchema: {
    readonly $id: "#/components/schemas/tagsSchema";
    readonly description: "A list of tags with a version number";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["version", "tags"];
    readonly properties: {
        readonly version: {
            readonly type: "integer";
            readonly description: "The version of the schema used to model the tags.";
        };
        readonly tags: {
            readonly type: "array";
            readonly description: "A list of tags.";
            readonly items: {
                readonly $ref: "#/components/schemas/tagSchema";
            };
        };
    };
    readonly components: {
        readonly schemas: {
            readonly tagSchema: {
                readonly $id: "#/components/schemas/tagSchema";
                readonly type: "object";
                readonly description: "Representation of a [tag](https://docs.getunleash.io/reference/feature-toggles#tags)";
                readonly additionalProperties: false;
                readonly required: readonly ["value", "type"];
                readonly properties: {
                    readonly value: {
                        readonly type: "string";
                        readonly description: "The value of the tag.";
                        readonly minLength: 2;
                        readonly maxLength: 50;
                        readonly example: "a-tag-value";
                    };
                    readonly type: {
                        readonly type: "string";
                        readonly minLength: 2;
                        readonly maxLength: 50;
                        readonly description: "The [type](https://docs.getunleash.io/reference/feature-toggles#tags) of the tag";
                        readonly example: "simple";
                    };
                    readonly color: {
                        readonly type: "string";
                        readonly description: "The hexadecimal color code for the tag type.";
                        readonly example: "#FFFFFF";
                        readonly pattern: "^#[0-9A-Fa-f]{6}$";
                        readonly nullable: true;
                    };
                };
                readonly components: {};
            };
        };
    };
};
export type TagsSchema = FromSchema<typeof tagsSchema>;
//# sourceMappingURL=tags-schema.d.ts.map