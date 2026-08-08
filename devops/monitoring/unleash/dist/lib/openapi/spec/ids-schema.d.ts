import type { FromSchema } from 'json-schema-to-ts';
export declare const idsSchema: {
    readonly $id: "#/components/schemas/idsSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly description: "Used for bulk deleting multiple ids";
    readonly required: readonly ["ids"];
    readonly properties: {
        readonly ids: {
            readonly type: "array";
            readonly description: "Ids, for instance userid";
            readonly items: {
                readonly type: "number";
                readonly minimum: 0;
            };
            readonly example: readonly [12, 212];
        };
    };
    readonly components: {};
};
export type IdsSchema = FromSchema<typeof idsSchema>;
//# sourceMappingURL=ids-schema.d.ts.map