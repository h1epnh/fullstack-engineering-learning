import type { FromSchema } from 'json-schema-to-ts';
export declare const emailSchema: {
    readonly $id: "#/components/schemas/emailSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["email"];
    readonly description: "Represents the email of a user. Used to send email communication (reset password, welcome mail etc)";
    readonly properties: {
        readonly email: {
            readonly description: "The email address";
            readonly type: "string";
            readonly example: "test@example.com";
        };
    };
    readonly components: {};
};
export type EmailSchema = FromSchema<typeof emailSchema>;
//# sourceMappingURL=email-schema.d.ts.map