import type { FromSchema } from 'json-schema-to-ts';
export declare const createInvitedUserSchema: {
    readonly $id: "#/components/schemas/createInvitedUserSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["email", "name", "password"];
    readonly description: "Data used to create a user that has been invited to Unleash.";
    readonly properties: {
        readonly username: {
            readonly type: "string";
            readonly description: "The user's username. Must be unique if provided.";
            readonly example: "Hunter";
        };
        readonly email: {
            readonly type: "string";
            readonly description: "The invited user's email address";
            readonly example: "hunter@example.com";
        };
        readonly name: {
            readonly type: "string";
            readonly description: "The user's name";
            readonly example: "Hunter Burgan";
        };
        readonly password: {
            readonly type: "string";
            readonly description: "The user's password";
            readonly example: "hunter2";
        };
    };
    readonly components: {};
};
export type CreateInvitedUserSchema = FromSchema<typeof createInvitedUserSchema>;
//# sourceMappingURL=create-invited-user-schema.d.ts.map