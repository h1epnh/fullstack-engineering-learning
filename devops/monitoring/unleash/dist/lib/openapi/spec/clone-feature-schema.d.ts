import type { FromSchema } from 'json-schema-to-ts';
export declare const cloneFeatureSchema: {
    readonly $id: "#/components/schemas/cloneFeatureSchema";
    readonly type: "object";
    readonly required: readonly ["name"];
    readonly description: "Copy of a feature with a new name";
    readonly properties: {
        readonly name: {
            readonly type: "string";
            readonly description: "The name of the new feature";
            readonly example: "new-feature";
        };
        readonly replaceGroupId: {
            readonly type: "boolean";
            readonly example: true;
            readonly description: "Whether to use the new feature name as its group ID or not. Group ID is used for calculating [stickiness](https://docs.getunleash.io/reference/stickiness#calculation). Defaults to true.";
        };
    };
    readonly components: {};
};
export type CloneFeatureSchema = FromSchema<typeof cloneFeatureSchema>;
//# sourceMappingURL=clone-feature-schema.d.ts.map