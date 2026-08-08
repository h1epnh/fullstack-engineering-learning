import type { FromSchema } from 'json-schema-to-ts';
export declare const createTagSchema: {
    readonly $id: "#/components/schemas/createTagSchema";
    readonly description: "Data used to create a new [tag](https://docs.getunleash.io/reference/feature-toggles#tags)";
    readonly properties: {
        readonly value: {
            readonly type: "string";
            readonly pattern: "^\\s*\\S.{0,48}\\S\\s*$";
            readonly description: "The value of the tag. The value must be between 2 and 50 characters long. Leading and trailing whitespace is ignored and will be trimmed before saving the tag value.";
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
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["value", "type"];
};
export type CreateTagSchema = FromSchema<typeof createTagSchema>;
//# sourceMappingURL=create-tag-schema.d.ts.map