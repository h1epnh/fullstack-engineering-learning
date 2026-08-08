import type { FromSchema } from 'json-schema-to-ts';
export declare const sortOrderSchema: {
    readonly $id: "#/components/schemas/sortOrderSchema";
    readonly type: "object";
    readonly description: "A map of object IDs and their corresponding sort orders.";
    readonly additionalProperties: {
        readonly type: "integer";
        readonly description: "Sort order for the object whose ID is the key used for this property.";
        readonly example: 6;
    };
    readonly components: {};
};
export type SortOrderSchema = FromSchema<typeof sortOrderSchema>;
//# sourceMappingURL=sort-order-schema.d.ts.map