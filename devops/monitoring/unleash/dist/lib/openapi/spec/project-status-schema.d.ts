import type { FromSchema } from 'json-schema-to-ts';
export declare const projectStatusSchema: {
    readonly $id: "#/components/schemas/projectStatusSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["activityCountByDate", "resources", "health", "lifecycleSummary", "staleFlags"];
    readonly description: "Schema representing the overall status of a project, including an array of activity records. Each record in the activity array contains a date and a count, providing a snapshot of the project’s activity level over time.";
    readonly properties: {
        readonly activityCountByDate: {
            readonly $ref: "#/components/schemas/projectActivitySchema";
            readonly description: "Array of activity records with date and count, representing the project’s daily activity statistics.";
        };
        readonly health: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["current"];
            readonly description: "Information about the project's health rating";
            readonly properties: {
                readonly current: {
                    readonly type: "integer";
                    readonly minimum: 0;
                    readonly description: "The project's current health score, based on the ratio of healthy flags to stale and potentially stale flags.";
                    readonly example: 100;
                };
            };
        };
        readonly resources: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["apiTokens", "members", "segments"];
            readonly description: "Key resources within the project";
            readonly properties: {
                readonly apiTokens: {
                    readonly type: "integer";
                    readonly minimum: 0;
                    readonly description: "The number of API tokens created specifically for this project.";
                };
                readonly members: {
                    readonly type: "integer";
                    readonly minimum: 0;
                    readonly description: "The number of users who have been granted roles in this project. Does not include users who have access via groups.";
                };
                readonly segments: {
                    readonly type: "integer";
                    readonly minimum: 0;
                    readonly description: "The number of segments that are scoped to this project.";
                };
            };
        };
        readonly staleFlags: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly description: "Information on stale and potentially stale flags in this project.";
            readonly required: readonly ["total"];
            readonly properties: {
                readonly total: {
                    readonly type: "integer";
                    readonly minimum: 0;
                    readonly description: "The total number of flags in this project that are stale or potentially stale.";
                };
            };
        };
        readonly lifecycleSummary: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly description: "Feature flag lifecycle statistics for this project.";
            readonly required: readonly ["initial", "preLive", "live", "completed", "archived"];
            readonly properties: {
                readonly initial: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly description: "Statistics on feature flags in a given stage in this project.";
                    readonly required: readonly ["averageDays", "currentFlags"];
                    readonly properties: {
                        readonly averageDays: {
                            readonly type: "number";
                            readonly nullable: true;
                            readonly description: "The average number of days a feature flag remains in a stage in this project. Will be null if Unleash doesn't have any data for this stage yet.";
                            readonly example: 5;
                        };
                        readonly currentFlags: {
                            readonly type: "integer";
                            readonly description: "The number of feature flags currently in a stage in this project.";
                            readonly example: 10;
                        };
                    };
                };
                readonly preLive: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly description: "Statistics on feature flags in a given stage in this project.";
                    readonly required: readonly ["averageDays", "currentFlags"];
                    readonly properties: {
                        readonly averageDays: {
                            readonly type: "number";
                            readonly nullable: true;
                            readonly description: "The average number of days a feature flag remains in a stage in this project. Will be null if Unleash doesn't have any data for this stage yet.";
                            readonly example: 5;
                        };
                        readonly currentFlags: {
                            readonly type: "integer";
                            readonly description: "The number of feature flags currently in a stage in this project.";
                            readonly example: 10;
                        };
                    };
                };
                readonly live: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly description: "Statistics on feature flags in a given stage in this project.";
                    readonly required: readonly ["averageDays", "currentFlags"];
                    readonly properties: {
                        readonly averageDays: {
                            readonly type: "number";
                            readonly nullable: true;
                            readonly description: "The average number of days a feature flag remains in a stage in this project. Will be null if Unleash doesn't have any data for this stage yet.";
                            readonly example: 5;
                        };
                        readonly currentFlags: {
                            readonly type: "integer";
                            readonly description: "The number of feature flags currently in a stage in this project.";
                            readonly example: 10;
                        };
                    };
                };
                readonly completed: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly description: "Statistics on feature flags in a given stage in this project.";
                    readonly required: readonly ["averageDays", "currentFlags"];
                    readonly properties: {
                        readonly averageDays: {
                            readonly type: "number";
                            readonly nullable: true;
                            readonly description: "The average number of days a feature flag remains in a stage in this project. Will be null if Unleash doesn't have any data for this stage yet.";
                            readonly example: 5;
                        };
                        readonly currentFlags: {
                            readonly type: "integer";
                            readonly description: "The number of feature flags currently in a stage in this project.";
                            readonly example: 10;
                        };
                    };
                };
                readonly archived: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly required: readonly ["currentFlags", "last30Days"];
                    readonly description: "Information on archived flags in this project.";
                    readonly properties: {
                        readonly currentFlags: {
                            readonly type: "integer";
                            readonly description: "The number of archived feature flags in this project. If a flag is deleted permanently, it will no longer be counted as part of this statistic.";
                            readonly example: 10;
                        };
                        readonly last30Days: {
                            readonly type: "integer";
                            readonly description: "The number of flags in this project that have been changed over the last 30 days.";
                            readonly example: 5;
                        };
                    };
                };
            };
        };
    };
    readonly components: {
        readonly schemas: {
            readonly projectActivitySchema: {
                readonly $id: "#/components/schemas/projectActivitySchema";
                readonly type: "array";
                readonly description: "An array of project activity information. Each item contains a date and the total number of activities for that date.";
                readonly items: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly required: readonly ["date", "count"];
                    readonly properties: {
                        readonly date: {
                            readonly type: "string";
                            readonly example: "2022-12-14";
                            readonly description: "Activity date";
                        };
                        readonly count: {
                            readonly type: "integer";
                            readonly minimum: 0;
                            readonly description: "Activity count";
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
export type ProjectStatusSchema = FromSchema<typeof projectStatusSchema>;
//# sourceMappingURL=project-status-schema.d.ts.map