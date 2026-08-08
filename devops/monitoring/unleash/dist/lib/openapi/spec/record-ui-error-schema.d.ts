import type { FromSchema } from 'json-schema-to-ts';
export declare const recordUiErrorSchema: {
    readonly $id: "#/components/schemas/recordUiErrorSchema";
    readonly type: "object";
    readonly components: {};
    readonly required: readonly ["errorMessage"];
    readonly description: "An object representing an error from the UI";
    readonly properties: {
        readonly errorMessage: {
            readonly type: "string";
            readonly description: "The error message";
        };
        readonly errorStack: {
            readonly type: "string";
            readonly description: "The stack trace of the error";
        };
    };
};
export type RecordUiErrorSchema = FromSchema<typeof recordUiErrorSchema>;
//# sourceMappingURL=record-ui-error-schema.d.ts.map