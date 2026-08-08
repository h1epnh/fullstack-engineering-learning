import type { FromSchema } from 'json-schema-to-ts';
export declare const resourceLimitsSchema: {
    readonly $id: "#/components/schemas/resourceLimitsSchema";
    readonly type: "object";
    readonly description: "A map of resource names and their limits.";
    readonly required: readonly ["segmentValues", "strategySegments", "actionSetActions", "actionSetsPerProject", "actionSetFilters", "actionSetFilterValues", "signalEndpoints", "signalTokensPerEndpoint", "featureEnvironmentStrategies", "constraintValues", "environments", "projects", "apiTokens", "segments", "featureFlags", "constraints"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly segmentValues: {
            readonly type: "integer";
            readonly example: 10;
            readonly description: "The maximum number of values per segment allowed.";
        };
        readonly strategySegments: {
            readonly type: "integer";
            readonly example: 10;
            readonly description: "The maximum number of strategy segments allowed.";
        };
        readonly actionSetActions: {
            readonly type: "integer";
            readonly example: 10;
            readonly description: "The maximum number of actions per action set allowed.";
        };
        readonly actionSetsPerProject: {
            readonly type: "integer";
            readonly example: 10;
            readonly description: "The maximum number of action set definitions per project allowed.";
        };
        readonly actionSetFilters: {
            readonly type: "integer";
            readonly example: 10;
            readonly description: "The maximum number of filters per action set allowed.";
        };
        readonly actionSetFilterValues: {
            readonly type: "integer";
            readonly example: 10;
            readonly description: "The maximum number of filter values inside an action set allowed.";
        };
        readonly signalEndpoints: {
            readonly type: "integer";
            readonly example: 10;
            readonly description: "The maximum number of signal endpoints allowed.";
        };
        readonly signalTokensPerEndpoint: {
            readonly type: "integer";
            readonly example: 10;
            readonly description: "The maximum number of signal tokens per endpoint allowed.";
        };
        readonly featureEnvironmentStrategies: {
            readonly type: "integer";
            readonly example: 30;
            readonly description: "The maximum number of feature environment strategies allowed.";
        };
        readonly constraintValues: {
            readonly type: "integer";
            readonly example: 250;
            readonly description: "The maximum number of values for a single constraint.";
        };
        readonly constraints: {
            readonly type: "integer";
            readonly example: 30;
            readonly description: "The maximum number of constraints in a single strategy.";
        };
        readonly environments: {
            readonly type: "integer";
            readonly minimum: 1;
            readonly example: 50;
            readonly description: "The maximum number of environments allowed.";
        };
        readonly apiTokens: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly example: 2000;
            readonly description: "The maximum number of SDK and admin API tokens you can have at the same time. This limit applies only to server-side and client-side SDK tokens and to admin tokens. Personal access tokens are not subject to this limit. The limit applies to the total number of tokens across all projects in your organization.";
        };
        readonly projects: {
            readonly type: "integer";
            readonly minimum: 1;
            readonly example: 500;
            readonly description: "The maximum number of projects allowed.";
        };
        readonly segments: {
            readonly type: "integer";
            readonly example: 300;
            readonly description: "The maximum number of segments allowed.";
        };
        readonly featureFlags: {
            readonly type: "integer";
            readonly minimum: 1;
            readonly example: 5000;
            readonly description: "The maximum number of feature flags you can have at the same time. Archived flags do not count towards this limit.";
        };
    };
    readonly components: {};
};
export type ResourceLimitsSchema = FromSchema<typeof resourceLimitsSchema>;
//# sourceMappingURL=resource-limits-schema.d.ts.map