import type { FromSchema } from 'json-schema-to-ts';
export declare const importTogglesValidateSchema: {
    readonly $id: "#/components/schemas/importTogglesValidateSchema";
    readonly type: "object";
    readonly required: readonly ["errors", "warnings"];
    readonly additionalProperties: false;
    readonly description: "An object containing [feature import](https://docs.getunleash.io/reference/deploy/environment-import-export) validation results.";
    readonly properties: {
        readonly errors: {
            readonly description: "A list of errors that prevent the provided data from being successfully imported.";
            readonly type: "array";
            readonly example: readonly [{
                readonly message: "You cannot import a feature that already exist in other projects. You already have the following features defined outside of project default:";
                readonly affectedItems: readonly ["my-feature (in project project-854)"];
            }];
            readonly items: {
                readonly $ref: "#/components/schemas/importTogglesValidateItemSchema";
            };
        };
        readonly warnings: {
            readonly type: "array";
            readonly description: "A list of warnings related to the provided data.";
            readonly example: readonly [{
                readonly message: "The following strategy types will be used in import. Please make sure the strategy type parameters are configured as in source environment:";
                readonly affectedItems: readonly ["custom-strategy-7"];
            }];
            readonly items: {
                readonly $ref: "#/components/schemas/importTogglesValidateItemSchema";
            };
        };
        readonly permissions: {
            readonly type: "array";
            readonly description: "Any additional permissions required to import the data. If the list is empty, you require no additional permissions beyond what your user already has.";
            readonly items: {
                readonly $ref: "#/components/schemas/importTogglesValidateItemSchema";
            };
            readonly example: readonly [];
        };
    };
    readonly components: {
        readonly schemas: {
            readonly importTogglesValidateItemSchema: {
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
        };
    };
};
export type ImportTogglesValidateSchema = FromSchema<typeof importTogglesValidateSchema>;
//# sourceMappingURL=import-toggles-validate-schema.d.ts.map