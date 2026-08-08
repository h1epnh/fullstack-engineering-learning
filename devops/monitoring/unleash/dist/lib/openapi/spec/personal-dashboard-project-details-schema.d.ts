import type { FromSchema } from 'json-schema-to-ts';
export declare const personalDashboardProjectDetailsSchema: {
    readonly $id: "#/components/schemas/personalDashboardProjectDetailsSchema";
    readonly type: "object";
    readonly description: "Project details in personal dashboard";
    readonly additionalProperties: false;
    readonly required: readonly ["owners", "roles", "latestEvents", "onboardingStatus", "insights"];
    readonly properties: {
        readonly insights: {
            readonly type: "object";
            readonly description: "Insights for the project, including flag data and project health information.";
            readonly additionalProperties: false;
            readonly required: readonly ["avgHealthCurrentWindow", "avgHealthPastWindow", "totalFlags", "activeFlags", "staleFlags", "potentiallyStaleFlags", "health"];
            readonly properties: {
                readonly avgHealthCurrentWindow: {
                    readonly type: "integer";
                    readonly minimum: 0;
                    readonly description: "The project's average health score over the last 4 weeks";
                    readonly example: 80;
                    readonly nullable: true;
                };
                readonly avgHealthPastWindow: {
                    readonly type: "integer";
                    readonly minimum: 0;
                    readonly description: "The project's average health score over the previous 4-week window";
                    readonly example: 70;
                    readonly nullable: true;
                };
                readonly totalFlags: {
                    readonly type: "integer";
                    readonly minimum: 0;
                    readonly example: 100;
                    readonly description: "The current number of non-archived flags";
                };
                readonly activeFlags: {
                    readonly type: "integer";
                    readonly minimum: 0;
                    readonly example: 98;
                    readonly description: "The number of active flags that are not stale or potentially stale";
                };
                readonly staleFlags: {
                    readonly type: "integer";
                    readonly minimum: 0;
                    readonly example: 0;
                    readonly description: "The current number of flags that have been manually marked as stale";
                };
                readonly potentiallyStaleFlags: {
                    readonly type: "integer";
                    readonly minimum: 0;
                    readonly example: 2;
                    readonly description: "The number of potentially stale flags as calculated by Unleash";
                };
                readonly health: {
                    readonly type: "integer";
                    readonly minimum: 0;
                    readonly description: "The project's current health score";
                    readonly example: 80;
                };
            };
        };
        readonly onboardingStatus: {
            readonly type: "object";
            readonly oneOf: readonly [{
                readonly type: "object";
                readonly properties: {
                    readonly status: {
                        readonly type: "string";
                        readonly enum: readonly ["onboarding-started", "onboarded"];
                        readonly example: "onboarding-started";
                    };
                };
                readonly required: readonly ["status"];
                readonly additionalProperties: false;
            }, {
                readonly type: "object";
                readonly properties: {
                    readonly status: {
                        readonly type: "string";
                        readonly enum: readonly ["first-flag-created"];
                        readonly example: "first-flag-created";
                    };
                    readonly feature: {
                        readonly type: "string";
                        readonly description: "The name of the feature flag";
                        readonly example: "my-feature-flag";
                    };
                };
                readonly required: readonly ["status", "feature"];
                readonly additionalProperties: false;
            }];
            readonly description: "The current onboarding status of the project.";
        };
        readonly latestEvents: {
            readonly type: "array";
            readonly description: "The latest events for the project.";
            readonly items: {
                readonly type: "object";
                readonly description: "An event summary";
                readonly additionalProperties: false;
                readonly required: readonly ["summary", "createdBy", "createdByImageUrl", "id", "createdAt"];
                readonly properties: {
                    readonly id: {
                        readonly type: "integer";
                        readonly minimum: 1;
                        readonly description: "The ID of the event.";
                    };
                    readonly summary: {
                        readonly type: "string";
                        readonly nullable: true;
                        readonly description: "**[Experimental]** A markdown-formatted summary of the event.";
                    };
                    readonly createdBy: {
                        readonly type: "string";
                        readonly description: "Which user created this event";
                        readonly example: "johndoe";
                    };
                    readonly createdByImageUrl: {
                        readonly type: "string";
                        readonly description: "URL used for the user profile image of the event author";
                        readonly example: "https://example.com/242x200.png";
                    };
                    readonly createdAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly description: "When the event was recorded";
                        readonly example: "2021-09-01T12:00:00Z";
                    };
                };
            };
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
        readonly roles: {
            readonly type: "array";
            readonly description: "The list of roles that the user has in this project.";
            readonly items: {
                readonly type: "object";
                readonly description: "An Unleash role.";
                readonly additionalProperties: false;
                readonly required: readonly ["name", "id", "type"];
                readonly properties: {
                    readonly name: {
                        readonly type: "string";
                        readonly example: "Owner";
                        readonly description: "The name of the role";
                    };
                    readonly id: {
                        readonly type: "integer";
                        readonly example: 4;
                        readonly description: "The id of the role";
                    };
                    readonly type: {
                        readonly type: "string";
                        readonly enum: readonly ["custom", "project"];
                        readonly example: "project";
                        readonly description: "The type of the role";
                    };
                };
            };
        };
    };
    readonly components: {
        readonly schemas: {};
    };
};
export type PersonalDashboardProjectDetailsSchema = FromSchema<typeof personalDashboardProjectDetailsSchema>;
//# sourceMappingURL=personal-dashboard-project-details-schema.d.ts.map