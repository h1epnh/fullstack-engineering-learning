import type { FromSchema } from 'json-schema-to-ts';
export declare const personalDashboardSchema: {
    readonly $id: "#/components/schemas/personalDashboardSchema";
    readonly type: "object";
    readonly description: "Project and flags relevant to the user";
    readonly additionalProperties: false;
    readonly required: readonly ["projects", "flags", "admins", "projectOwners"];
    readonly properties: {
        readonly admins: {
            readonly type: "array";
            readonly description: "Users with the admin role in Unleash.";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["id"];
                readonly properties: {
                    readonly id: {
                        readonly type: "integer";
                        readonly description: "The user ID.";
                        readonly example: 1;
                    };
                    readonly name: {
                        readonly type: "string";
                        readonly description: "The user's name.";
                        readonly example: "Ash Ketchum";
                    };
                    readonly username: {
                        readonly type: "string";
                        readonly description: "The user's username.";
                        readonly example: "pokémaster13";
                    };
                    readonly imageUrl: {
                        readonly type: "string";
                        readonly example: "https://example.com/peek-at-you.jpg";
                    };
                    readonly email: {
                        readonly type: "string";
                        readonly example: "user@example.com";
                    };
                };
            };
        };
        readonly projectOwners: {
            readonly type: "array";
            readonly description: "Users with the project owner role in Unleash. Only contains owners of projects that are visible to the user.";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["ownerType", "name"];
                readonly properties: {
                    readonly ownerType: {
                        readonly type: "string";
                        readonly enum: readonly ["user"];
                        readonly description: "The type of the owner; will always be `user`.";
                    };
                    readonly name: {
                        readonly type: "string";
                        readonly example: "User Name";
                        readonly description: "The name displayed for the user. Can be the user's name, username, or email, depending on what they have provided.";
                    };
                    readonly imageUrl: {
                        readonly type: "string";
                        readonly nullable: true;
                        readonly description: "The URL of the user's profile image.";
                        readonly example: "https://example.com/image.jpg";
                    };
                    readonly email: {
                        readonly type: "string";
                        readonly nullable: true;
                        readonly description: "The user's email address.";
                        readonly example: "user@example.com";
                    };
                };
            };
        };
        readonly projects: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["id", "name", "health", "memberCount", "featureCount"];
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                        readonly example: "my-project-id";
                        readonly description: "The id of the project";
                    };
                    readonly name: {
                        readonly type: "string";
                        readonly example: "My Project";
                        readonly description: "The name of the project";
                    };
                    readonly health: {
                        readonly type: "integer";
                        readonly example: 50;
                        readonly minimum: 0;
                        readonly description: "An indicator of the [project's health](https://docs.getunleash.io/reference/technical-debt#project-status) on a scale from 0 to 100";
                    };
                    readonly memberCount: {
                        readonly type: "integer";
                        readonly example: 4;
                        readonly minimum: 0;
                        readonly description: "The number of members this project has";
                    };
                    readonly featureCount: {
                        readonly type: "integer";
                        readonly example: 10;
                        readonly minimum: 0;
                        readonly description: "The number of features this project has";
                    };
                };
            };
            readonly description: "A list of projects that a user participates in with any role e.g. member or owner or any custom role";
        };
        readonly flags: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["name", "project", "type"];
                readonly properties: {
                    readonly name: {
                        readonly type: "string";
                        readonly example: "my-flag";
                        readonly description: "The name of the flag";
                    };
                    readonly project: {
                        readonly type: "string";
                        readonly example: "my-project-id";
                        readonly description: "The id of the feature project";
                    };
                    readonly type: {
                        readonly type: "string";
                        readonly example: "release";
                        readonly description: "The type of the feature flag";
                    };
                };
            };
            readonly description: "A list of flags a user created or favorited";
        };
    };
    readonly components: {
        readonly schemas: {};
    };
};
export type PersonalDashboardSchema = FromSchema<typeof personalDashboardSchema>;
//# sourceMappingURL=personal-dashboard-schema.d.ts.map