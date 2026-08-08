import type { FromSchema } from 'json-schema-to-ts';
export declare const setStrategySortOrderSchema: {
    readonly $id: "#/components/schemas/setStrategySortOrderSchema";
    readonly type: "array";
    readonly description: "An array of strategies with their new sort order";
    readonly items: {
        readonly type: "object";
        readonly additionalProperties: false;
        readonly required: readonly ["id", "sortOrder"];
        readonly description: "A strategy with its new sort order";
        readonly properties: {
            readonly id: {
                readonly type: "string";
                readonly example: "9c40958a-daac-400e-98fb-3bb438567008";
                readonly description: "The ID of the strategy";
            };
            readonly sortOrder: {
                readonly type: "number";
                readonly example: 1;
                readonly description: "The new sort order of the strategy";
            };
        };
    };
    readonly components: {};
};
export type SetStrategySortOrderSchema = FromSchema<typeof setStrategySortOrderSchema>;
//# sourceMappingURL=set-strategy-sort-order-schema.d.ts.map