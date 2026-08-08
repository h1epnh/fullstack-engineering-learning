import type { FromSchema } from 'json-schema-to-ts';
export declare const inactiveUsersSchema: {
    readonly $id: "#/components/schemas/inactiveUsersSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly description: "A list of users that has been flagged as inactive";
    readonly required: readonly ["version", "inactiveUsers"];
    readonly properties: {
        readonly version: {
            readonly description: "The version of this schema. Used to keep track of compatibility";
            readonly type: "integer";
            readonly minimum: 1;
            readonly example: 1;
        };
        readonly inactiveUsers: {
            readonly description: "The list of users that are flagged as inactive";
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/components/schemas/inactiveUserSchema";
            };
        };
    };
    readonly components: {
        readonly inactiveUserSchema: {
            readonly $id: "#/components/schemas/inactiveUserSchema";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly description: "A Unleash user that has been flagged as inactive";
            readonly required: readonly ["id"];
            readonly properties: {
                readonly id: {
                    readonly description: "The user id";
                    readonly type: "integer";
                    readonly minimum: 0;
                    readonly example: 123;
                };
                readonly name: {
                    readonly description: "Name of the user";
                    readonly type: "string";
                    readonly example: "Ned Ryerson";
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
                    readonly example: "nedryerson";
                    readonly nullable: true;
                };
                readonly seenAt: {
                    readonly description: "The last time this user logged in";
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly nullable: true;
                    readonly example: "2024-01-25T11:42:00.345Z";
                };
                readonly createdAt: {
                    readonly description: "The user was created at this time";
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly example: "2023-12-31T23:59:59.999Z";
                };
                readonly patSeenAt: {
                    readonly description: "The last time this user's PAT token (if any) was used";
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly nullable: true;
                    readonly example: "2024-01-01T23:59:59.999Z";
                };
            };
            readonly components: {};
        };
    };
};
export type InactiveUsersSchema = FromSchema<typeof inactiveUsersSchema>;
//# sourceMappingURL=inactive-users-schema.d.ts.map