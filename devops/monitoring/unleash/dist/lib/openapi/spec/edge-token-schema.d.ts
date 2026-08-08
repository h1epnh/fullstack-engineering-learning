import type { FromSchema } from 'json-schema-to-ts';
import { ApiTokenType } from '../../types/models/api-token';
export declare const edgeTokenSchema: {
    readonly $id: "#/components/schemas/edgeTokenSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["token", "projects", "type"];
    readonly description: "A representation of a client token, limiting access to [CLIENT](https://docs.getunleash.io/reference/api-tokens-and-client-keys#client-tokens) (used by serverside SDKs) or [FRONTEND](https://docs.getunleash.io/reference/api-tokens-and-client-keys#frontend-tokens) (used by proxy SDKs)";
    readonly properties: {
        readonly projects: {
            readonly description: "The list of projects this token has access to. If the token has access to specific projects they will be listed here. If the token has access to all projects it will be represented as [`*`]";
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly example: readonly ["developerexperience", "enterprisegrowth"];
        };
        readonly type: {
            readonly description: "The [API token](https://docs.getunleash.io/reference/api-tokens-and-client-keys)'s **type**. Unleash supports three different types of API tokens ([ADMIN](https://docs.getunleash.io/reference/api-tokens-and-client-keys#admin-tokens), [CLIENT](https://docs.getunleash.io/reference/api-tokens-and-client-keys#client-tokens), [FRONTEND](https://docs.getunleash.io/reference/api-tokens-and-client-keys#frontend-tokens)). They all have varying access, so when validating a token it's important to know what kind you're dealing with";
            readonly type: "string";
            readonly enum: ApiTokenType[];
            readonly example: "client";
        };
        readonly token: {
            readonly description: "The actual token value. [Unleash API tokens](https://docs.getunleash.io/reference/api-tokens-and-client-keys) are comprised of three parts. <project(s)>:<environment>.randomcharacters";
            readonly type: "string";
            readonly example: "*:development.5c806b5320c88cf27e81f3e9b97dab298a77d5879316e3c2d806206b";
        };
    };
    readonly components: {};
};
export type EdgeTokenSchema = FromSchema<typeof edgeTokenSchema>;
//# sourceMappingURL=edge-token-schema.d.ts.map