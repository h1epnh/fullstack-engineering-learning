import type { FromSchema } from 'json-schema-to-ts';
export declare const archivedFeatureSchema: {
    readonly $id: "#/components/schemas/archivedFeatureSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["name", "project"];
    readonly description: "An archived project feature flag definition";
    readonly properties: {
        readonly name: {
            readonly type: "string";
            readonly example: "disable-comments";
            readonly description: "Unique feature name";
        };
        readonly type: {
            readonly type: "string";
            readonly example: "kill-switch";
            readonly description: "Type of the flag e.g. experiment, kill-switch, release, operational, permission";
        };
        readonly description: {
            readonly type: "string";
            readonly nullable: true;
            readonly example: "Controls disabling of the comments section in case of an incident";
            readonly description: "Detailed description of the feature";
        };
        readonly project: {
            readonly type: "string";
            readonly example: "dx-squad";
            readonly description: "Name of the project the feature belongs to";
        };
        readonly stale: {
            readonly type: "boolean";
            readonly example: false;
            readonly description: "`true` if the feature is stale based on the age and feature type, otherwise `false`.";
        };
        readonly impressionData: {
            readonly type: "boolean";
            readonly example: false;
            readonly description: "`true` if the impression data collection is enabled for the feature, otherwise `false`.";
        };
        readonly createdAt: {
            readonly type: "string";
            readonly format: "date-time";
            readonly example: "2023-01-28T15:21:39.975Z";
            readonly description: "The date the feature was created";
        };
        readonly archivedAt: {
            readonly type: "string";
            readonly format: "date-time";
            readonly example: "2023-01-29T15:21:39.975Z";
            readonly description: "The date the feature was archived";
        };
        readonly lastSeenAt: {
            readonly type: "string";
            readonly format: "date-time";
            readonly nullable: true;
            readonly deprecated: true;
            readonly example: "2023-01-28T16:21:39.975Z";
            readonly description: "The date when metrics where last collected for the feature. This field was deprecated in v5, use the one in featureEnvironmentSchema";
        };
        readonly environments: {
            readonly type: "array";
            readonly deprecated: true;
            readonly description: "The list of environments where the feature can be used";
            readonly items: {
                readonly type: "object";
                readonly properties: {
                    readonly name: {
                        readonly type: "string";
                        readonly example: "my-dev-env";
                        readonly description: "The name of the environment";
                    };
                    readonly lastSeenAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly nullable: true;
                        readonly example: "2023-01-28T16:21:39.975Z";
                        readonly description: "The date when metrics where last collected for the feature environment";
                    };
                    readonly enabled: {
                        readonly type: "boolean";
                        readonly example: true;
                        readonly description: "`true` if the feature is enabled for the environment, otherwise `false`.";
                    };
                };
            };
        };
    };
    readonly components: {
        readonly schemas: {};
    };
};
export type ArchivedFeatureSchema = FromSchema<typeof archivedFeatureSchema>;
//# sourceMappingURL=archived-feature-schema.d.ts.map