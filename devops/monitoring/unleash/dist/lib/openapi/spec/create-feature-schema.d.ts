import type { FromSchema } from 'json-schema-to-ts';
export declare const createFeatureSchema: {
    readonly $id: "#/components/schemas/createFeatureSchema";
    readonly type: "object";
    readonly description: "Data used to create a new feature flag.";
    readonly required: readonly ["name"];
    readonly properties: {
        readonly name: {
            readonly type: "string";
            readonly example: "disable-comments";
            readonly description: "Unique feature name";
        };
        readonly type: {
            readonly enum: readonly ["experiment", "kill-switch", "release", "operational", "permission"];
            readonly example: "release";
            readonly description: "The feature flag's [type](https://docs.getunleash.io/reference/feature-toggles#feature-flag-types). One of experiment, kill-switch, release, operational, or permission";
        };
        readonly description: {
            readonly type: "string";
            readonly nullable: true;
            readonly example: "Controls disabling of the comments section in case of an incident";
            readonly description: "Detailed description of the feature";
        };
        readonly impressionData: {
            readonly type: "boolean";
            readonly example: false;
            readonly description: "`true` if the impression data collection is enabled for the feature, otherwise `false`.";
        };
        readonly tags: {
            readonly type: "array";
            readonly description: "Tags to add to the feature.";
            readonly items: {
                readonly $ref: "#/components/schemas/tagSchema";
            };
        };
    };
    readonly components: {
        readonly schemas: {
            readonly tagSchema: {
                readonly $id: "#/components/schemas/tagSchema";
                readonly type: "object";
                readonly description: "Representation of a [tag](https://docs.getunleash.io/reference/feature-toggles#tags)";
                readonly additionalProperties: false;
                readonly required: readonly ["value", "type"];
                readonly properties: {
                    readonly value: {
                        readonly type: "string";
                        readonly description: "The value of the tag.";
                        readonly minLength: 2;
                        readonly maxLength: 50;
                        readonly example: "a-tag-value";
                    };
                    readonly type: {
                        readonly type: "string";
                        readonly minLength: 2;
                        readonly maxLength: 50;
                        readonly description: "The [type](https://docs.getunleash.io/reference/feature-toggles#tags) of the tag";
                        readonly example: "simple";
                    };
                    readonly color: {
                        readonly type: "string";
                        readonly description: "The hexadecimal color code for the tag type.";
                        readonly example: "#FFFFFF";
                        readonly pattern: "^#[0-9A-Fa-f]{6}$";
                        readonly nullable: true;
                    };
                };
                readonly components: {};
            };
        };
    };
};
export type CreateFeatureSchema = FromSchema<typeof createFeatureSchema>;
//# sourceMappingURL=create-feature-schema.d.ts.map