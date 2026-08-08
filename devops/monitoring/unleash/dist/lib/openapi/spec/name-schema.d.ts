import type { FromSchema } from 'json-schema-to-ts';
export declare const nameSchema: {
    readonly $id: "#/components/schemas/nameSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["name"];
    readonly description: "An object with a name";
    readonly properties: {
        readonly name: {
            readonly description: "The name of the represented object.";
            readonly example: "betaUser";
            readonly type: "string";
        };
    };
    readonly components: {};
};
export type NameSchema = FromSchema<typeof nameSchema>;
//# sourceMappingURL=name-schema.d.ts.map