import type { FromSchema } from 'json-schema-to-ts';
export declare const patchSchema: {
    readonly $id: "#/components/schemas/patchSchema";
    readonly type: "object";
    readonly required: readonly ["path", "op"];
    readonly description: "A [JSON patch](https://www.rfc-editor.org/rfc/rfc6902) operation description";
    readonly properties: {
        readonly path: {
            readonly type: "string";
            readonly description: "The path to the property to operate on";
            readonly example: "/type";
        };
        readonly op: {
            readonly type: "string";
            readonly enum: readonly ["add", "remove", "replace", "copy", "move"];
            readonly description: "The kind of operation to perform";
            readonly example: "replace";
        };
        readonly from: {
            readonly type: "string";
            readonly description: "The target to move or copy from, if performing one of those operations";
            readonly example: "/type";
        };
        readonly value: {
            readonly description: "The value to add or replace, if performing one of those operations";
            readonly example: "kill-switch";
        };
    };
    readonly components: {};
};
export type PatchSchema = FromSchema<typeof patchSchema>;
//# sourceMappingURL=patch-schema.d.ts.map