import type { FromSchema } from 'json-schema-to-ts';
export declare const createUserSchema: {
    readonly $id: "#/components/schemas/createUserSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["rootRole"];
    readonly description: "The payload must contain at least one of the name and email properties, though which one is up to you. For the user to be able to log in to the system, the user must have an email.";
    readonly properties: {
        readonly username: {
            readonly description: "The user's username. Must be provided if email is not provided.";
            readonly type: "string";
            readonly example: "hunter";
        };
        readonly email: {
            readonly description: "The user's email address. Must be provided if username is not provided.";
            readonly type: "string";
            readonly example: "user@example.com";
        };
        readonly name: {
            readonly description: "The user's name (not the user's username).";
            readonly type: "string";
            readonly example: "Sam Seawright";
        };
        readonly password: {
            readonly type: "string";
            readonly example: "k!5As3HquUrQ";
            readonly description: "Password for the user";
        };
        readonly rootRole: {
            readonly description: "The role to assign to the user. Can be either the role's ID or its unique name.";
            readonly oneOf: readonly [{
                readonly type: "integer";
                readonly example: 1;
                readonly minimum: 0;
            }, {
                readonly type: "string";
                readonly example: "Admin";
                readonly enum: readonly ["Admin", "Editor", "Viewer", "Owner", "Member"];
            }];
        };
        readonly sendEmail: {
            readonly type: "boolean";
            readonly example: false;
            readonly description: "Whether to send a welcome email with a login link to the user or not. Defaults to `true`.";
        };
    };
    readonly components: {};
};
export type CreateUserSchema = FromSchema<typeof createUserSchema>;
//# sourceMappingURL=create-user-schema.d.ts.map