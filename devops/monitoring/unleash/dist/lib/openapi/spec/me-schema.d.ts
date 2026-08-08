import type { FromSchema } from 'json-schema-to-ts';
export declare const meSchema: {
    readonly $id: "#/components/schemas/meSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["user", "permissions", "feedback", "splash"];
    readonly description: "Detailed user information";
    readonly properties: {
        readonly user: {
            readonly $ref: "#/components/schemas/userSchema";
        };
        readonly permissions: {
            readonly description: "User permissions for projects and environments";
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/components/schemas/permissionSchema";
            };
        };
        readonly feedback: {
            readonly description: "User feedback information";
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/components/schemas/feedbackResponseSchema";
            };
        };
        readonly splash: {
            readonly description: "Splash screen configuration";
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "boolean";
            };
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
            readonly permissionSchema: {
                readonly $id: "#/components/schemas/permissionSchema";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["permission"];
                readonly description: "Project and environment permissions";
                readonly properties: {
                    readonly permission: {
                        readonly description: "[Project](https://docs.getunleash.io/reference/rbac#project-permissions) or [environment](https://docs.getunleash.io/reference/rbac#environment-permissions) permission name";
                        readonly type: "string";
                        readonly example: "UPDATE_FEATURE_STRATEGY";
                    };
                    readonly project: {
                        readonly description: "The project this permission applies to";
                        readonly type: "string";
                        readonly example: "my-project";
                    };
                    readonly environment: {
                        readonly description: "The environment this permission applies to";
                        readonly type: "string";
                        readonly example: "development";
                    };
                };
                readonly components: {};
            };
            readonly feedbackResponseSchema: {
                readonly $id: "#/components/schemas/feedbackResponseSchema";
                readonly additionalProperties: false;
                readonly type: "object";
                readonly description: "User feedback information about a particular feedback item.";
                readonly properties: {
                    readonly userId: {
                        readonly description: "The ID of the user that gave the feedback.";
                        readonly type: "integer";
                        readonly example: 2;
                    };
                    readonly neverShow: {
                        readonly description: "`true` if the user has asked never to see this feedback questionnaire again.";
                        readonly type: "boolean";
                        readonly example: false;
                    };
                    readonly given: {
                        readonly description: "When this feedback was given";
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly nullable: true;
                        readonly example: "2023-07-06T08:29:21.282Z";
                    };
                    readonly feedbackId: {
                        readonly description: "The name of the feedback session";
                        readonly type: "string";
                        readonly example: "pnps";
                    };
                };
                readonly components: {};
            };
        };
    };
};
export type MeSchema = FromSchema<typeof meSchema>;
//# sourceMappingURL=me-schema.d.ts.map