import type { FromSchema } from 'json-schema-to-ts';
export declare const updateTagsSchema: {
    readonly $id: "#/components/schemas/updateTagsSchema";
    readonly type: "object";
    readonly description: "Represents a set of changes to a feature's tags, such as adding or removing tags.";
    readonly additionalProperties: false;
    readonly required: readonly ["addedTags", "removedTags"];
    readonly properties: {
        readonly addedTags: {
            readonly type: "array";
            readonly description: "Tags to add to the feature.";
            readonly items: {
                readonly $ref: "#/components/schemas/tagSchema";
            };
        };
        readonly removedTags: {
            readonly type: "array";
            readonly description: "Tags to remove from the feature.";
            readonly items: {
                readonly $ref: "#/components/schemas/tagSchema";
            };
        };
    };
    readonly example: {
        readonly addedTags: readonly [{
            readonly value: "tag-to-add";
            readonly type: "simple";
        }];
        readonly removedTags: readonly [{
            readonly value: "tag-to-remove";
            readonly type: "simple";
        }];
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
export type UpdateTagsSchema = FromSchema<typeof updateTagsSchema>;
//# sourceMappingURL=update-tags-schema.d.ts.map