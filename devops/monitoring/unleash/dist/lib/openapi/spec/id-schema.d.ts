import type { FromSchema } from 'json-schema-to-ts';
export declare const idSchema: {
    readonly $id: "#/components/schemas/idSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly description: "Email id used for password reset";
    readonly required: readonly ["id"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly description: "User email";
            readonly example: "user@example.com";
        };
    };
    readonly components: {};
};
export type IdSchema = FromSchema<typeof idSchema>;
//# sourceMappingURL=id-schema.d.ts.map