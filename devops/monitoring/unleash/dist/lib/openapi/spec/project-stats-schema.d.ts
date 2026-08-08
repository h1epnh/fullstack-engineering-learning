import type { FromSchema } from 'json-schema-to-ts';
export declare const projectStatsSchema: {
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
export type ProjectStatsSchema = FromSchema<typeof projectStatsSchema>;
//# sourceMappingURL=project-stats-schema.d.ts.map