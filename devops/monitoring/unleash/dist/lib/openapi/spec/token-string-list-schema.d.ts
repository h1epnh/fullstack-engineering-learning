import type { FromSchema } from 'json-schema-to-ts';
export declare const tokenStringListSchema: {
    readonly $id: "#/components/schemas/tokenStringListSchema";
    readonly type: "object";
    readonly description: "A list of unleash tokens to validate against known tokens";
    readonly required: readonly ["tokens"];
    readonly properties: {
        readonly tokens: {
            readonly description: "Tokens that we want to get access information about";
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly example: readonly ["aproject:development.randomstring", "[]:production.randomstring"];
        };
    };
    readonly components: {};
};
export type TokenStringListSchema = FromSchema<typeof tokenStringListSchema>;
//# sourceMappingURL=token-string-list-schema.d.ts.map