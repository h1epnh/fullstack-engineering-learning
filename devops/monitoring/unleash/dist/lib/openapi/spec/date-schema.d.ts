import type { FromSchema } from 'json-schema-to-ts';
export declare const dateSchema: {
    readonly $id: "#/components/schemas/dateSchema";
    readonly description: "A representation of a date. Either as a date-time string or as a UNIX timestamp.";
    readonly oneOf: readonly [{
        readonly type: "string";
        readonly format: "date-time";
        readonly description: "An [RFC-3339](https://www.rfc-editor.org/rfc/rfc3339.html)-compliant timestamp.";
        readonly example: "2023-07-27T11:23:44Z";
    }, {
        readonly type: "integer";
        readonly description: "A [UNIX timestamp](https://en.wikipedia.org/wiki/Unix_time).";
        readonly example: 1690449593;
    }];
    readonly components: {};
};
export type DateSchema = FromSchema<typeof dateSchema>;
//# sourceMappingURL=date-schema.d.ts.map