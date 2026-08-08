import type { FromSchema } from 'json-schema-to-ts';
export declare const groupSchema: {
    readonly $id: "#/components/schemas/groupSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["name"];
    readonly description: "A detailed information about a user group";
    readonly properties: {
        readonly id: {
            readonly description: "The group id";
            readonly type: "integer";
            readonly example: 1;
        };
        readonly name: {
            readonly description: "The name of the group";
            readonly type: "string";
            readonly example: "DX team";
        };
        readonly description: {
            readonly description: "A custom description of the group";
            readonly type: "string";
            readonly nullable: true;
            readonly example: "Current members of the DX squad";
        };
        readonly mappingsSSO: {
            readonly description: "A list of SSO groups that should map to this Unleash group";
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly example: readonly ["SSOGroup1", "SSOGroup2"];
        };
        readonly rootRole: {
            readonly type: "number";
            readonly nullable: true;
            readonly description: "A role id that is used as the root role for all users in this group. This can be either the id of the Viewer, Editor or Admin role.";
            readonly example: 1;
        };
        readonly createdBy: {
            readonly description: "A user who created this group";
            readonly type: "string";
            readonly nullable: true;
            readonly example: "admin";
        };
        readonly createdAt: {
            readonly description: "When was this group created";
            readonly type: "string";
            readonly format: "date-time";
            readonly nullable: true;
            readonly example: "2023-06-30T11:41:00.123Z";
        };
        readonly users: {
            readonly type: "array";
            readonly description: "A list of users belonging to this group";
            readonly items: {
                readonly $ref: "#/components/schemas/groupUserModelSchema";
            };
        };
        readonly projects: {
            readonly description: "A list of projects where this group is used";
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly example: readonly ["default", "my-project"];
        };
        readonly userCount: {
            readonly description: "The number of users that belong to this group";
            readonly example: 1;
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly scimId: {
            readonly description: "The SCIM ID of the group, only present if managed by SCIM";
            readonly type: "string";
            readonly nullable: true;
            readonly example: "01HTMEXAMPLESCIMID7SWWGHN7";
        };
    };
    readonly components: {
        readonly schemas: {
            readonly groupUserModelSchema: {
                readonly $id: "#/components/schemas/groupUserModelSchema";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["user"];
                readonly description: "Details for a single user belonging to a group";
                readonly properties: {
                    readonly joinedAt: {
                        readonly description: "The date when the user joined the group";
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly example: "2023-06-30T11:41:00.123Z";
                    };
                    readonly createdBy: {
                        readonly description: "The username of the user who added this user to this group";
                        readonly type: "string";
                        readonly nullable: true;
                        readonly example: "admin";
                    };
                    readonly user: {
                        readonly $ref: "#/components/schemas/userSchema";
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
                    };
                };
            };
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
        };
    };
};
export type GroupSchema = FromSchema<typeof groupSchema>;
//# sourceMappingURL=group-schema.d.ts.map