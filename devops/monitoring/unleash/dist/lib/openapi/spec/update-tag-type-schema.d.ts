import type { FromSchema } from 'json-schema-to-ts';
export declare const updateTagTypeSchema: {
    readonly $id: "#/components/schemas/updateTagTypeSchema";
    readonly type: "object";
    readonly description: "The request body for updating a tag type.";
    readonly properties: {
        readonly description: {
            readonly type: "string";
            readonly description: "The description of the tag type.";
            readonly example: "A tag type for describing the color of a tag.";
        };
        readonly icon: {
            readonly type: "string";
            readonly description: "The icon of the tag type.";
            readonly example: "not-really-used";
        };
        readonly color: {
            readonly type: "string";
            readonly description: "The hexadecimal color code for the tag type.";
            readonly example: "#FFFFFF";
            readonly pattern: "^#[0-9A-Fa-f]{6}$";
        };
    };
    readonly components: {};
};
export type UpdateTagTypeSchema = FromSchema<typeof updateTagTypeSchema>;
//# sourceMappingURL=update-tag-type-schema.d.ts.map