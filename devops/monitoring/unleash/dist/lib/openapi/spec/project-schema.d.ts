import type { FromSchema } from 'json-schema-to-ts';
export declare const projectSchema: {
    readonly $id: "#/components/schemas/projectSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "name"];
    readonly description: "A definition of the project used for projects listing purposes";
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly example: "dx-squad";
            readonly description: "The id of this project";
        };
        readonly name: {
            readonly type: "string";
            readonly example: "DX-Squad";
            readonly description: "The name of this project";
        };
        readonly description: {
            readonly deprecated: true;
            readonly type: "string";
            readonly nullable: true;
            readonly example: "DX squad feature release";
            readonly description: "Additional information about the project";
        };
        readonly health: {
            readonly type: "number";
            readonly example: 50;
            readonly description: "An indicator of the [project's health](https://docs.getunleash.io/reference/technical-debt#project-status) on a scale from 0 to 100";
        };
        readonly featureCount: {
            readonly type: "number";
            readonly example: 10;
            readonly description: "The number of features this project has";
        };
        readonly staleFeatureCount: {
            readonly deprecated: true;
            readonly type: "number";
            readonly example: 10;
            readonly description: "The number of stale features this project has";
        };
        readonly potentiallyStaleFeatureCount: {
            readonly deprecated: true;
            readonly type: "number";
            readonly example: 10;
            readonly description: "The number of potentially stale features this project has";
        };
        readonly memberCount: {
            readonly type: "number";
            readonly example: 4;
            readonly description: "The number of members this project has";
        };
        readonly createdAt: {
            readonly type: "string";
            readonly description: "When this project was created.";
            readonly example: "2023-07-27T12:12:28Z";
            readonly format: "date-time";
        };
        readonly updatedAt: {
            readonly deprecated: true;
            readonly type: "string";
            readonly format: "date-time";
            readonly nullable: true;
            readonly description: "When this project was last updated.";
            readonly example: "2023-07-28T12:12:28Z";
        };
        readonly lastUpdatedAt: {
            readonly type: "string";
            readonly format: "date-time";
            readonly nullable: true;
            readonly description: "When this project was last updated.";
            readonly example: "2023-07-28T12:12:28Z";
        };
        readonly archivedAt: {
            readonly type: "string";
            readonly format: "date-time";
            readonly nullable: true;
            readonly description: "When this project was archived.";
            readonly example: "2023-07-28T12:12:28Z";
        };
        readonly favorite: {
            readonly type: "boolean";
            readonly example: true;
            readonly description: "`true` if the project was favorited, otherwise `false`.";
        };
        readonly mode: {
            readonly type: "string";
            readonly enum: readonly ["open", "protected", "private"];
            readonly example: "open";
            readonly description: "The project's [collaboration mode](https://docs.getunleash.io/reference/project-collaboration-mode). Determines whether non-project members can submit change requests or not.";
        };
        readonly defaultStickiness: {
            readonly deprecated: true;
            readonly type: "string";
            readonly example: "userId";
            readonly description: "A default stickiness for the project affecting the default stickiness value for variants and Gradual Rollout strategy";
        };
        readonly avgTimeToProduction: {
            readonly deprecated: true;
            readonly type: "number";
            readonly example: 10;
            readonly description: "The average time from when a feature was created to when it was enabled in the \"production\" environment during the current window";
        };
        readonly lastReportedFlagUsage: {
            readonly type: "string";
            readonly format: "date-time";
            readonly nullable: true;
            readonly description: "Across all flags in your project this is the last time usage metrics where reported from connected applications.";
            readonly example: "2023-07-28T12:12:28Z";
        };
        readonly owners: {
            readonly description: "The users and/or groups that have the \"owner\" role in this project. If no such users or groups exist, the list will contain the \"system\" owner instead.";
            readonly oneOf: readonly [{
                readonly type: "array";
                readonly minItems: 1;
                readonly items: {
                    readonly anyOf: readonly [{
                        readonly type: "object";
                        readonly required: readonly ["ownerType", "name"];
                        readonly properties: {
                            readonly ownerType: {
                                readonly type: "string";
                                readonly enum: readonly ["user"];
                            };
                            readonly name: {
                                readonly type: "string";
                                readonly example: "User Name";
                            };
                            readonly imageUrl: {
                                readonly type: "string";
                                readonly nullable: true;
                                readonly example: "https://example.com/image.jpg";
                            };
                            readonly email: {
                                readonly type: "string";
                                readonly nullable: true;
                                readonly example: "user@example.com";
                            };
                        };
                    }, {
                        readonly type: "object";
                        readonly required: readonly ["ownerType", "name"];
                        readonly properties: {
                            readonly ownerType: {
                                readonly type: "string";
                                readonly enum: readonly ["group"];
                            };
                            readonly name: {
                                readonly type: "string";
                                readonly example: "Group Name";
                            };
                        };
                    }];
                };
            }, {
                readonly type: "array";
                readonly minItems: 1;
                readonly maxItems: 1;
                readonly items: {
                    readonly type: "object";
                    readonly required: readonly ["ownerType"];
                    readonly properties: {
                        readonly ownerType: {
                            readonly type: "string";
                            readonly enum: readonly ["system"];
                        };
                    };
                };
            }];
        };
    };
    readonly components: {};
};
export type ProjectSchema = FromSchema<typeof projectSchema>;
//# sourceMappingURL=project-schema.d.ts.map