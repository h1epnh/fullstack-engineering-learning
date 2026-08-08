import type { FromSchema } from 'json-schema-to-ts';
export declare const publicSignupTokenSchema: {
    readonly $id: "#/components/schemas/publicSignupTokenSchema";
    readonly description: "Used for transporting a [public invite link](https://docs.getunleash.io/reference/public-signup#public-sign-up-tokens)";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["secret", "url", "name", "expiresAt", "createdAt", "createdBy", "enabled", "role"];
    readonly properties: {
        readonly secret: {
            readonly description: "The actual value of the token. This is the part that is used by Unleash to create an invite link";
            readonly type: "string";
            readonly example: "a3c84b25409ea8ca1782ef17f94a42fc";
        };
        readonly url: {
            readonly description: "The public signup link for the token. Users who follow this link will be taken to a signup page where they can create an Unleash user.";
            readonly type: "string";
            readonly nullable: true;
            readonly example: "https://sandbox.getunleash.io/enterprise/new-user?invite=a3c84b25409ea8ca1782ef17f94a42fc";
        };
        readonly name: {
            readonly description: "The token's name. Only for displaying in the UI";
            readonly type: "string";
            readonly example: "Invite public viewers";
        };
        readonly enabled: {
            readonly description: "Whether the token is active. This property will always be `false` for a token that has expired.";
            readonly type: "boolean";
            readonly example: true;
        };
        readonly expiresAt: {
            readonly type: "string";
            readonly description: "The time when the token will expire.";
            readonly format: "date-time";
            readonly example: "2023-04-12T11:13:31.960Z";
        };
        readonly createdAt: {
            readonly type: "string";
            readonly format: "date-time";
            readonly description: "When the token was created.";
            readonly example: "2023-04-12T11:13:31.960Z";
        };
        readonly createdBy: {
            readonly description: "The creator's email or username";
            readonly example: "someone@example.com";
            readonly type: "string";
            readonly nullable: true;
        };
        readonly users: {
            readonly type: "array";
            readonly description: "Array of users that have signed up using the token.";
            readonly items: {
                readonly $ref: "#/components/schemas/userSchema";
            };
            readonly nullable: true;
        };
        readonly role: {
            readonly description: "Users who sign up using this token will be given this role.";
            readonly $ref: "#/components/schemas/roleSchema";
        };
    };
    readonly components: {
        readonly schemas: {
            readonly userSchema: {
                readonly $id: "#/components/schemas/userSchema";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly description: "An Unleash user";
                readonly required: readonly ["id"];
                readonly properties: {
                    readonly id: {
                        readonly description: "The user id";
                        readonly type: "integer";
                        readonly example: 123;
                    };
                    readonly isAPI: {
                        readonly description: "Deprecated in v5. Used internally to know which operations the user should be allowed to perform";
                        readonly type: "boolean";
                        readonly example: true;
                        readonly deprecated: true;
                    };
                    readonly name: {
                        readonly description: "Name of the user";
                        readonly type: "string";
                        readonly example: "User";
                        readonly nullable: true;
                    };
                    readonly email: {
                        readonly description: "Email of the user";
                        readonly type: "string";
                        readonly example: "user@example.com";
                    };
                    readonly username: {
                        readonly description: "A unique username for the user";
                        readonly type: "string";
                        readonly example: "hunter";
                        readonly nullable: true;
                    };
                    readonly imageUrl: {
                        readonly description: "URL used for the user profile image";
                        readonly type: "string";
                        readonly example: "https://example.com/242x200.png";
                    };
                    readonly inviteLink: {
                        readonly description: "If the user is actively inviting other users, this is the link that can be shared with other users";
                        readonly type: "string";
                        readonly example: "http://localhost:4242/invite-link/some-secret";
                    };
                    readonly loginAttempts: {
                        readonly description: "How many unsuccessful attempts at logging in has the user made";
                        readonly type: "integer";
                        readonly minimum: 0;
                        readonly example: 3;
                    };
                    readonly emailSent: {
                        readonly description: "Is the welcome email sent to the user or not";
                        readonly type: "boolean";
                        readonly example: false;
                    };
                    readonly rootRole: {
                        readonly description: "Which [root role](https://docs.getunleash.io/reference/rbac#predefined-roles) this user is assigned";
                        readonly type: "integer";
                        readonly example: 1;
                        readonly minimum: 0;
                    };
                    readonly seenAt: {
                        readonly description: "The last time this user logged in";
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly nullable: true;
                        readonly example: "2023-06-30T11:42:00.345Z";
                    };
                    readonly createdAt: {
                        readonly description: "The user was created at this time";
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly example: "2023-06-30T11:41:00.123Z";
                    };
                    readonly accountType: {
                        readonly description: "A user is either an actual User or a Service Account";
                        readonly type: "string";
                        readonly enum: readonly ["User", "Service Account"];
                        readonly example: "User";
                    };
                    readonly permissions: {
                        readonly description: "Deprecated";
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                    readonly scimId: {
                        readonly description: "The SCIM ID of the user, only present if managed by SCIM";
                        readonly type: "string";
                        readonly nullable: true;
                        readonly example: "01HTMEXAMPLESCIMID7SWWGHN6";
                    };
                    readonly activeSessions: {
                        readonly description: "Count of active browser sessions for this user";
                        readonly type: "integer";
                        readonly nullable: true;
                        readonly example: 2;
                    };
                    readonly deletedSessions: {
                        readonly description: "Experimental. The number of deleted browser sessions after last login";
                        readonly type: "number";
                        readonly example: 1;
                    };
                };
                readonly components: {};
            };
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
export type PublicSignupTokenSchema = FromSchema<typeof publicSignupTokenSchema>;
//# sourceMappingURL=public-signup-token-schema.d.ts.map