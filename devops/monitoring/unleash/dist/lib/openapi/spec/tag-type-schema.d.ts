import type { FromSchema } from 'json-schema-to-ts';
export declare const tagTypeSchema: {
    readonly $id: "#/components/schemas/tagTypeSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly description: "A tag type.";
    readonly required: readonly ["name"];
    readonly properties: {
        readonly name: {
            readonly type: "string";
            readonly description: "The name of the tag type.";
            readonly example: "color";
        };
        readonly description: {
            readonly type: "string";
            readonly description: "The description of the tag type.";
            readonly example: "A tag type for describing the color of a tag.";
        };
        readonly icon: {
            readonly type: "string";
            readonly nullable: true;
            readonly description: "The icon of the tag type.";
            readonly example: "not-really-used";
        };
        readonly color: {
            readonly type: "string";
            readonly nullable: true;
            readonly description: "The hexadecimal color code for the tag type.";
            readonly example: "#FFFFFF";
            readonly pattern: "^#[0-9A-Fa-f]{6}$";
        };
    };
    readonly components: {};
};
export type TagTypeSchema = FromSchema<typeof tagTypeSchema>;
//# sourceMappingURL=tag-type-schema.d.ts.map