import type { FromSchema } from 'json-schema-to-ts';
export declare const parentFeatureOptionsSchema: {
    readonly $id: "#/components/schemas/parentFeatureOptionsSchema";
    readonly type: "array";
    readonly description: "A list of parent feature names available for a given child feature. Features that have their own parents are excluded.";
    readonly items: {
        readonly type: "string";
    };
    readonly components: {};
};
export type ParentFeatureOptionsSchema = FromSchema<typeof parentFeatureOptionsSchema>;
//# sourceMappingURL=parent-feature-options-schema.d.ts.map