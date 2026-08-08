import type { FromSchema } from 'json-schema-to-ts';
export declare const overrideSchema: {
    readonly $id: "#/components/schemas/overrideSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["contextName", "values"];
    readonly description: "An override for deciding which variant should be assigned to a user based on the context name";
    readonly properties: {
        readonly contextName: {
            readonly description: "The name of the context field used to determine overrides";
            readonly type: "string";
            readonly example: "userId";
        };
        readonly values: {
            readonly description: "Which values that should be overriden";
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly example: readonly ["red", "blue"];
        };
    };
    readonly components: {};
};
export type OverrideSchema = FromSchema<typeof overrideSchema>;
//# sourceMappingURL=override-schema.d.ts.map