import type { FromSchema } from 'json-schema-to-ts';
export declare const adminCountSchema: {
    readonly $id: "#/components/schemas/adminCountSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly description: "Contains total admin counts for an Unleash instance.";
    readonly required: readonly ["password", "noPassword", "service"];
    readonly properties: {
        readonly password: {
            readonly type: "number";
            readonly description: "Total number of admins that have a password set.";
        };
        readonly noPassword: {
            readonly type: "number";
            readonly description: "Total number of admins that do not have a password set. May be SSO, but may also be users that did not set a password yet.";
        };
        readonly service: {
            readonly type: "number";
            readonly description: "Total number of service accounts that have the admin root role.";
        };
    };
    readonly components: {};
};
export type AdminCountSchema = FromSchema<typeof adminCountSchema>;
//# sourceMappingURL=admin-count-schema.d.ts.map