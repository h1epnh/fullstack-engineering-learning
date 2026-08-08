import type { FromSchema } from 'json-schema-to-ts';
export declare const validatePasswordSchema: {
    readonly $id: "#/components/schemas/validatePasswordSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["password"];
    readonly description: "Used to validate passwords obeying [Unleash password guidelines](https://docs.getunleash.io/reference/deploy/securing-unleash#password-requirements)";
    readonly properties: {
        readonly password: {
            readonly description: "The password to validate";
            readonly type: "string";
            readonly example: "hunter2";
        };
    };
    readonly components: {};
};
export type ValidatePasswordSchema = FromSchema<typeof validatePasswordSchema>;
//# sourceMappingURL=validate-password-schema.d.ts.map