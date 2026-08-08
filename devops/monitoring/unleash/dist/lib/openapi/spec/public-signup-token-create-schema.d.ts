import type { FromSchema } from 'json-schema-to-ts';
export declare const publicSignupTokenCreateSchema: {
    readonly $id: "#/components/schemas/publicSignupTokenCreateSchema";
    readonly type: "object";
    readonly description: "Used for creating a [public invite link](https://docs.getunleash.io/reference/public-signup#public-sign-up-tokens)";
    readonly additionalProperties: false;
    readonly required: readonly ["name", "expiresAt"];
    readonly properties: {
        readonly name: {
            readonly description: "The token's name.";
            readonly type: "string";
        };
        readonly expiresAt: {
            readonly type: "string";
            readonly description: "The token's expiration date.";
            readonly format: "date-time";
        };
    };
    readonly components: {};
};
export type PublicSignupTokenCreateSchema = FromSchema<typeof publicSignupTokenCreateSchema>;
//# sourceMappingURL=public-signup-token-create-schema.d.ts.map