import type { FromSchema } from 'json-schema-to-ts';
export declare const tokenUserSchema: {
    readonly $id: "#/components/schemas/tokenUserSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly description: "A user identified by a token";
    readonly required: readonly ["id", "email", "token", "createdBy", "role"];
    readonly properties: {
        readonly id: {
            readonly type: "integer";
            readonly description: "The user id";
            readonly example: 7;
        };
        readonly name: {
            readonly description: "The name of the user";
            readonly type: "string";
            readonly example: "Test McTest";
        };
        readonly email: {
            readonly description: "The email of the user";
            readonly type: "string";
            readonly example: "test@example.com";
        };
        readonly token: {
            readonly description: "A token uniquely identifying a user";
            readonly type: "string";
            readonly example: "user:xyzrandomstring";
        };
        readonly createdBy: {
            readonly description: "A username or email identifying which user created this token";
            readonly type: "string";
            readonly nullable: true;
            readonly example: "admin@example.com";
        };
        readonly role: {
            readonly $ref: "#/components/schemas/roleSchema";
        };
    };
    readonly components: {
        readonly schemas: {
            readonly roleSchema: {
                readonly $id: "#/components/schemas/roleSchema";
                readonly type: "object";
                readonly description: "A role holds permissions to allow Unleash to decide what actions a role holder is allowed to perform";
                readonly additionalProperties: false;
                readonly required: readonly ["id", "type", "name"];
                readonly properties: {
                    readonly id: {
                        readonly type: "integer";
                        readonly description: "The role id";
                        readonly example: 9;
                        readonly minimum: 0;
                    };
                    readonly type: {
                        readonly description: "A role can either be a global root role (applies to all projects) or a project role";
                        readonly type: "string";
                        readonly example: "root";
                    };
                    readonly name: {
                        readonly description: "The name of the role";
                        readonly type: "string";
                        readonly example: "Editor";
                    };
                    readonly description: {
                        readonly description: "A more detailed description of the role and what use it's intended for";
                        readonly type: "string";
                        readonly example: "Users with the editor role have access to most features in Unleash but can not manage users and roles in the global scope. Editors will be added as project owners when creating projects and get superuser rights within the context of these projects. Users with the editor role will also get access to most permissions on the default project by default.";
                    };
                    readonly project: {
                        readonly description: "What project the role belongs to";
                        readonly type: "string";
                        readonly nullable: true;
                        readonly example: "default";
                    };
                };
                readonly components: {};
            };
        };
    };
};
export type TokenUserSchema = FromSchema<typeof tokenUserSchema>;
//# sourceMappingURL=token-user-schema.d.ts.map