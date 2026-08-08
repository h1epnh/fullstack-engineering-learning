import type { FromSchema } from 'json-schema-to-ts';
export declare const apiTokensSchema: {
    readonly $id: "#/components/schemas/apiTokensSchema";
    readonly type: "object";
    readonly description: "An object with [Unleash API tokens](https://docs.getunleash.io/reference/api-tokens-and-client-keys)";
    readonly additionalProperties: false;
    readonly required: readonly ["tokens"];
    readonly properties: {
        readonly tokens: {
            readonly type: "array";
            readonly description: "A list of Unleash API tokens.";
            readonly items: {
                readonly $ref: "#/components/schemas/apiTokenSchema";
            };
        };
    };
    readonly components: {
        readonly schemas: {
            readonly apiTokenSchema: {
                readonly $id: "#/components/schemas/apiTokenSchema";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["secret", "tokenName", "type", "project", "projects", "createdAt"];
                readonly description: "An overview of an [Unleash API token](https://docs.getunleash.io/reference/api-tokens-and-client-keys).";
                readonly properties: {
                    readonly secret: {
                        readonly type: "string";
                        readonly description: "The token used for authentication.";
                        readonly example: "project:environment.xyzrandomstring";
                    };
                    readonly username: {
                        readonly type: "string";
                        readonly deprecated: true;
                        readonly description: "This property was deprecated in Unleash v5. Prefer the `tokenName` property instead.";
                        readonly example: "a-name";
                    };
                    readonly tokenName: {
                        readonly type: "string";
                        readonly description: "A unique name for this particular token";
                        readonly example: "some-user";
                    };
                    readonly type: {
                        readonly type: "string";
                        readonly enum: import("../../types/models/api-token").ApiTokenType[];
                        readonly description: "The type of API token";
                        readonly example: "client";
                    };
                    readonly environment: {
                        readonly type: "string";
                        readonly description: "The environment the token has access to. `*` if it has access to all environments.";
                        readonly example: "development";
                    };
                    readonly project: {
                        readonly type: "string";
                        readonly description: "The project this token belongs to.";
                        readonly example: "developerexperience";
                    };
                    readonly projects: {
                        readonly type: "array";
                        readonly description: "The list of projects this token has access to. If the token has access to specific projects they will be listed here. If the token has access to all projects it will be represented as `[*]`";
                        readonly items: {
                            readonly type: "string";
                        };
                        readonly example: readonly ["developerexperience", "enterprisegrowth"];
                    };
                    readonly expiresAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly nullable: true;
                        readonly description: "The token's expiration date. NULL if the token doesn't have an expiration set.";
                        readonly example: "2023-04-19T08:15:14.000Z";
                    };
                    readonly createdAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly example: "2023-04-19T08:15:14.000Z";
                        readonly description: "When the token was created.";
                    };
                    readonly seenAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly nullable: true;
                        readonly example: "2023-04-19T08:15:14.000Z";
                        readonly description: "When the token was last seen/used to authenticate with. NULL if the token has not yet been used for authentication.";
                    };
                    readonly alias: {
                        readonly type: "string";
                        readonly nullable: true;
                        readonly description: "Alias is no longer in active use and will often be NULL. It's kept around as a way of allowing old proxy tokens created with the old metadata format to keep working.";
                        readonly example: "randomid-or-some-alias";
                    };
                };
                readonly components: {};
            };
        };
    };
};
export type ApiTokensSchema = FromSchema<typeof apiTokensSchema>;
//# sourceMappingURL=api-tokens-schema.d.ts.map