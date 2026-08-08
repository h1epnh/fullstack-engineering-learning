import type { FromSchema } from 'json-schema-to-ts';
export declare const adminFeaturesQuerySchema: {
    readonly $id: "#/components/schemas/adminFeaturesQuerySchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly description: "Query parameters used to modify the list of features returned.";
    readonly properties: {
        readonly tag: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly pattern: "\\w+:\\w+";
            };
            readonly description: "Used to filter by tags. For each entry, a TAGTYPE:TAGVALUE is expected";
            readonly example: readonly ["simple:mytag"];
        };
        readonly namePrefix: {
            readonly type: "string";
            readonly description: "A case-insensitive prefix filter for the names of feature flags";
            readonly example: "demo.part1";
        };
    };
    readonly components: {};
};
export type AdminFeaturesQuerySchema = FromSchema<typeof adminFeaturesQuerySchema>;
//# sourceMappingURL=admin-features-query-schema.d.ts.map