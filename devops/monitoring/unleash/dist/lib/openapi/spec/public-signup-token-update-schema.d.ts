import type { FromSchema } from 'json-schema-to-ts';
export declare const publicSignupTokenUpdateSchema: {
    readonly $id: "#/components/schemas/publicSignupTokenUpdateSchema";
    readonly description: "Used by Unleash for updating a token's expiration date or, when deleting the invite link, it's status";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly properties: {
        readonly expiresAt: {
            readonly type: "string";
            readonly description: "The token's expiration date.";
            readonly format: "date-time";
            readonly example: "2023-04-11T15:46:56Z";
        };
        readonly enabled: {
            readonly description: "Whether the token is active or not.";
            readonly type: "boolean";
            readonly example: true;
        };
    };
    readonly components: {};
};
export type PublicSignupTokenUpdateSchema = FromSchema<typeof publicSignupTokenUpdateSchema>;
//# sourceMappingURL=public-signup-token-update-schema.d.ts.map