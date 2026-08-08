import type { FromSchema } from 'json-schema-to-ts';
export declare const importTogglesValidateItemSchema: {
    readonly $id: "#/components/schemas/importTogglesValidateItemSchema";
    readonly type: "object";
    readonly required: readonly ["message", "affectedItems"];
    readonly additionalProperties: false;
    readonly description: "A description of an error or warning pertaining to a feature flag import job.";
    readonly properties: {
        readonly message: {
            readonly type: "string";
            readonly description: "The validation error message";
            readonly example: "You cannot import a feature that already exist in other projects. You already have the following features defined outside of project default:";
        };
        readonly affectedItems: {
            readonly type: "array";
            readonly description: "The items affected by this error message ";
            readonly example: readonly ["some-feature-a", "some-feature-b"];
            readonly items: {
                readonly type: "string";
            };
        };
    };
    readonly components: {
        readonly schemas: {};
    };
};
export type ImportTogglesValidateItemSchema = FromSchema<typeof importTogglesValidateItemSchema>;
//# sourceMappingURL=import-toggles-validate-item-schema.d.ts.map