import type { FromSchema } from 'json-schema-to-ts';
export declare const parentVariantOptionsSchema: {
    readonly $id: "#/components/schemas/parentVariantOptionsSchema";
    readonly type: "array";
    readonly description: "A list of parent variant names available for a given parent feature. This list includes strategy variants and feature environment variants.";
    readonly items: {
        readonly type: "string";
    };
    readonly components: {};
};
export type ParentVariantOptionsSchema = FromSchema<typeof parentVariantOptionsSchema>;
//# sourceMappingURL=parent-variant-options-schema.d.ts.map