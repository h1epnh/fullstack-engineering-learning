import type { FromSchema } from 'json-schema-to-ts';
export declare const loginSchema: {
    readonly $id: "#/components/schemas/loginSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["username", "password"];
    readonly description: "A username/password login request";
    readonly properties: {
        readonly username: {
            readonly description: "The username trying to log in";
            readonly type: "string";
            readonly example: "user";
        };
        readonly password: {
            readonly description: "The password of the user trying to log in";
            readonly type: "string";
            readonly example: "hunter2";
        };
    };
    readonly components: {};
};
export type LoginSchema = FromSchema<typeof loginSchema>;
//# sourceMappingURL=login-schema.d.ts.map