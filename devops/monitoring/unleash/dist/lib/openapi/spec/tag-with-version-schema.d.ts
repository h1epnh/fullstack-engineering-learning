import type { FromSchema } from 'json-schema-to-ts';
export declare const tagWithVersionSchema: {
    readonly $id: "#/components/schemas/tagWithVersionSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["version", "tag"];
    readonly description: "A tag with a version number representing the schema used to model the tag.";
    readonly properties: {
        readonly version: {
            readonly type: "integer";
            readonly description: "The version of the schema used to model the tag.";
            readonly example: 1;
        };
        readonly tag: {
            readonly $ref: "#/components/schemas/tagSchema";
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
export type TagWithVersionSchema = FromSchema<typeof tagWithVersionSchema>;
//# sourceMappingURL=tag-with-version-schema.d.ts.map