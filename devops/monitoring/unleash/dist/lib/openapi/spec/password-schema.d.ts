import type { FromSchema } from 'json-schema-to-ts';
export declare const passwordSchema: {
    readonly $id: "#/components/schemas/passwordSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["password"];
    readonly description: "Fields used to create new password or update old password";
    readonly properties: {
        readonly password: {
            readonly type: "string";
            readonly example: "k!5As3HquUrQ";
            readonly description: "The new password to change or validate.";
        };
        readonly oldPassword: {
            readonly type: "string";
            readonly example: "Oldk!5As3HquUrQ";
            readonly description: "The old password the user is changing. This field is for the non-admin users changing their own password.";
        };
        readonly confirmPassword: {
            readonly type: "string";
            readonly example: "k!5As3HquUrQ";
            readonly description: "The confirmation of the new password. This field is for the non-admin users changing their own password.";
        };
    };
    readonly components: {};
};
export type PasswordSchema = FromSchema<typeof passwordSchema>;
//# sourceMappingURL=password-schema.d.ts.map