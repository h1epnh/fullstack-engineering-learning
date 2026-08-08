import type { FromSchema } from 'json-schema-to-ts';
export declare const legalValueSchema: {
    readonly $id: "#/components/schemas/legalValueSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly description: "Describes a legal value. Typically used to limit possible values for contextFields or strategy properties";
    readonly required: readonly ["value"];
    readonly properties: {
        readonly value: {
            readonly description: "The valid value";
            readonly type: "string";
            readonly example: "#c154c1";
        };
        readonly description: {
            readonly description: "Describes this specific legal value";
            readonly type: "string";
            readonly example: "Deep fuchsia";
        };
    };
    readonly components: {};
};
export type LegalValueSchema = FromSchema<typeof legalValueSchema>;
//# sourceMappingURL=legal-value-schema.d.ts.map