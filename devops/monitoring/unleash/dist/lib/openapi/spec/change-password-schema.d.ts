import type { FromSchema } from 'json-schema-to-ts';
export declare const changePasswordSchema: {
    readonly $id: "#/components/schemas/changePasswordSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["token", "password"];
    readonly description: "Change password as long as the token is a valid token";
    readonly properties: {
        readonly token: {
            readonly description: "A reset token used to validate that the user is allowed to change the password.";
            readonly type: "string";
            readonly example: "$2a$15$QzeW/y5/MEppCWVEkoX5euejobYOLSd4We21LQjjKlWH9l2I3wCke";
        };
        readonly password: {
            readonly type: "string";
            readonly description: "The new password for the user";
            readonly example: "correct horse battery staple";
        };
    };
    readonly components: {};
};
export type ChangePasswordSchema = FromSchema<typeof changePasswordSchema>;
//# sourceMappingURL=change-password-schema.d.ts.map