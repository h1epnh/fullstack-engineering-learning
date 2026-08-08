import type { FromSchema } from 'json-schema-to-ts';
export declare const createPatSchema: {
    readonly $id: "#/components/schemas/createPatSchema";
    readonly description: "Describes the properties required to create a [personal access token](https://docs.getunleash.io/reference/api-tokens-and-client-keys#personal-access-tokens), or PAT. PATs are automatically scoped to the authenticated user.";
    readonly type: "object";
    readonly required: readonly ["description", "expiresAt"];
    readonly properties: {
        readonly description: {
            readonly type: "string";
            readonly description: "The PAT's description.";
            readonly example: "user:xyzrandomstring";
        };
        readonly expiresAt: {
            readonly type: "string";
            readonly format: "date-time";
            readonly description: "The PAT's expiration date.";
            readonly example: "2023-04-19T08:15:14.000Z";
        };
    };
    readonly components: {};
};
export type CreatePatSchema = FromSchema<typeof createPatSchema>;
//# sourceMappingURL=create-pat-schema.d.ts.map