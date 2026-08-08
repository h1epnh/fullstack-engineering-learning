import type { FromSchema } from 'json-schema-to-ts';
export declare const projectInsightsSchema: {
    readonly $id: "#/components/schemas/projectInsightsSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["stats", "leadTime", "featureTypeCounts", "health", "members"];
    readonly description: "A high-level overview of a project insights. It contains information such as project statistics, overall health, types of flags, members overview, change requests overview.";
    readonly properties: {
        readonly stats: {
            readonly $ref: "#/components/schemas/projectStatsSchema";
            readonly description: "Project statistics";
        };
        readonly health: {
            readonly type: "object";
            readonly required: readonly ["rating", "activeCount", "potentiallyStaleCount", "staleCount"];
            readonly properties: {
                readonly rating: {
                    readonly type: "integer";
                    readonly description: "An indicator of the [project's health](https://docs.getunleash.io/reference/technical-debt#project-status) on a scale from 0 to 100";
                    readonly example: 95;
                };
                readonly activeCount: {
                    readonly type: "number";
                    readonly description: "The number of active feature flags.";
                    readonly example: 12;
                };
                readonly potentiallyStaleCount: {
                    readonly type: "number";
                    readonly description: "The number of potentially stale feature flags.";
                    readonly example: 5;
                };
                readonly staleCount: {
                    readonly type: "number";
                    readonly description: "The number of stale feature flags.";
                    readonly example: 10;
                };
            };
            readonly description: "Health summary of the project";
        };
        readonly leadTime: {
            readonly type: "object";
            readonly $ref: "#/components/schemas/projectDoraMetricsSchema";
            readonly description: "Lead time (DORA) metrics";
        };
        readonly featureTypeCounts: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/components/schemas/featureTypeCountSchema";
            };
            readonly description: "The number of features of each type";
        };
        readonly members: {
            readonly type: "object";
            readonly required: readonly ["currentMembers", "change"];
            readonly properties: {
                readonly currentMembers: {
                    readonly type: "number";
                    readonly description: "The number of total project members";
                    readonly example: 10;
                };
                readonly change: {
                    readonly type: "number";
                    readonly description: "The change in the number of project members compared to the previous month";
                    readonly example: 10;
                };
            };
            readonly description: "Active/inactive users summary";
        };
    };
    readonly components: {
        readonly schemas: {
            readonly projectStatsSchema: {
                readonly $id: "#/components/schemas/projectStatsSchema";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["avgTimeToProdCurrentWindow", "createdCurrentWindow", "createdPastWindow", "archivedCurrentWindow", "archivedPastWindow", "projectActivityCurrentWindow", "projectActivityPastWindow", "projectMembersAddedCurrentWindow"];
                readonly description: "Statistics for a project, including the average time to production, number of features created, the project activity and more.\n\nStats are divided into current and previous **windows**.\n- The **current window** is the past 30 days.\n- The **previous window** is the 30 days **before** the current window (from 60 to 30 days ago)";
                readonly properties: {
                    readonly avgTimeToProdCurrentWindow: {
                        readonly type: "number";
                        readonly example: 10;
                        readonly description: "The average time from when a feature was created to when it was enabled in the \"production\" environment during the current window";
                    };
                    readonly createdCurrentWindow: {
                        readonly type: "number";
                        readonly example: 15;
                        readonly description: "The number of feature flags created during the current window";
                    };
                    readonly createdPastWindow: {
                        readonly type: "number";
                        readonly example: 15;
                        readonly description: "The number of feature flags created during the previous window";
                    };
                    readonly archivedCurrentWindow: {
                        readonly type: "number";
                        readonly example: 5;
                        readonly description: "The number of feature flags that were archived during the current window";
                    };
                    readonly archivedPastWindow: {
                        readonly type: "number";
                        readonly example: 5;
                        readonly description: "The number of feature flags that were archived during the previous window";
                    };
                    readonly projectActivityCurrentWindow: {
                        readonly type: "number";
                        readonly example: 100;
                        readonly description: "The number of project events that occurred during the current window";
                    };
                    readonly projectActivityPastWindow: {
                        readonly type: "number";
                        readonly example: 100;
                        readonly description: "The number of project events that occurred during the previous window";
                    };
                    readonly projectMembersAddedCurrentWindow: {
                        readonly type: "number";
                        readonly example: 1;
                        readonly description: "The number of members that were added to the project during the current window";
                    };
                };
                readonly components: {};
            };
            readonly featureTypeCountSchema: {
                readonly $id: "#/components/schemas/featureTypeCountSchema";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["type", "count"];
                readonly description: "A count of feature flags of a specific type";
                readonly properties: {
                    readonly type: {
                        readonly type: "string";
                        readonly example: "kill-switch";
                        readonly description: "Type of the flag e.g. experiment, kill-switch, release, operational, permission";
                    };
                    readonly count: {
                        readonly type: "number";
                        readonly example: 1;
                        readonly description: "Number of feature flags of this type";
                    };
                };
                readonly components: {
                    readonly schemas: {};
                };
            };
            readonly projectDoraMetricsSchema: {
                readonly $id: "#/components/schemas/projectDoraMetricsSchema";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["features"];
                readonly description: "A projects dora metrics";
                readonly properties: {
                    readonly projectAverage: {
                        readonly type: "number";
                        readonly description: "The average time it takes a feature flag to be enabled in production. The measurement unit is days.";
                    };
                    readonly features: {
                        readonly type: "array";
                        readonly items: {
                            readonly $ref: "#/components/schemas/doraFeaturesSchema";
                        };
                        readonly description: "An array of objects containing feature flag name and timeToProduction values. The measurement unit of timeToProduction is days.";
                    };
                };
                readonly components: {
                    readonly schemas: {
                        readonly doraFeaturesSchema: {
                            readonly $id: "#/components/schemas/doraFeaturesSchema";
                            readonly type: "object";
                            readonly additionalProperties: false;
                            readonly required: readonly ["name", "timeToProduction"];
                            readonly description: "The representation of a dora time to production feature metric";
                            readonly properties: {
                                readonly name: {
                                    readonly type: "string";
                                    readonly description: "The name of a feature flag";
                                };
                                readonly timeToProduction: {
                                    readonly type: "number";
                                    readonly description: "The average number of days it takes a feature flag to get into production";
                                };
                            };
                            readonly components: {};
                        };
                    };
                };
            };
            readonly doraFeaturesSchema: {
                readonly $id: "#/components/schemas/doraFeaturesSchema";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["name", "timeToProduction"];
                readonly description: "The representation of a dora time to production feature metric";
                readonly properties: {
                    readonly name: {
                        readonly type: "string";
                        readonly description: "The name of a feature flag";
                    };
                    readonly timeToProduction: {
                        readonly type: "number";
                        readonly description: "The average number of days it takes a feature flag to get into production";
                    };
                };
                readonly components: {};
            };
        };
    };
};
export type ProjectInsightsSchema = FromSchema<typeof projectInsightsSchema>;
//# sourceMappingURL=project-insights-schema.d.ts.map