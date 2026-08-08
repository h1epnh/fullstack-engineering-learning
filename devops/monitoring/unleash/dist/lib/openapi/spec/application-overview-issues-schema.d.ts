import type { FromSchema } from 'json-schema-to-ts';
export declare const applicationOverviewIssuesSchema: {
    readonly $id: "#/components/schemas/applicationOverviewIssuesSchema";
    readonly type: "object";
    readonly description: "This list of issues that might be wrong with the application";
    readonly additionalProperties: false;
    readonly required: readonly ["missingStrategies"];
    readonly properties: {
        readonly missingStrategies: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly description: "The list of strategies that are missing from Unleash";
            readonly example: readonly ["feature1", "feature2"];
        };
    };
    readonly components: {};
};
export type ApplicationOverviewIssuesSchema = FromSchema<typeof applicationOverviewIssuesSchema>;
//# sourceMappingURL=application-overview-issues-schema.d.ts.map