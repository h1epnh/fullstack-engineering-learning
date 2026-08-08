import type { FromSchema } from 'json-schema-to-ts';
export declare const updateUserSchema: {
    readonly $id: "#/components/schemas/updateUserSchema";
    readonly type: "object";
    readonly description: "All fields that can be directly changed for the user";
    readonly properties: {
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
    };
    readonly components: {};
};
export type UpdateUserSchema = FromSchema<typeof updateUserSchema>;
//# sourceMappingURL=update-user-schema.d.ts.map