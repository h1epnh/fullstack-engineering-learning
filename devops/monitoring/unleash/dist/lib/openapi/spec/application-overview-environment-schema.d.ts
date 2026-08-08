import type { FromSchema } from 'json-schema-to-ts';
export declare const applicationOverviewEnvironmentSchema: {
    readonly $id: "#/components/schemas/applicationOverviewEnvironmentSchema";
    readonly type: "object";
    readonly description: "Data about an application environment";
    readonly additionalProperties: false;
    readonly required: readonly ["name", "instanceCount", "sdks", "lastSeen", "issues"];
    readonly properties: {
        readonly name: {
            readonly description: "Name of the application environment";
            readonly type: "string";
            readonly example: "production";
        };
        readonly instanceCount: {
            readonly description: "The number of instances of the application environment";
            readonly type: "number";
            readonly example: 5;
        };
        readonly sdks: {
            readonly description: "SDKs used in the application environment";
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly example: readonly ["unleash-client-node:5.4.0", "unleash-client-node:5.3.0"];
        };
        readonly lastSeen: {
            readonly type: "string";
            readonly nullable: true;
            readonly format: "date-time";
            readonly example: "2023-04-19T08:15:14.000Z";
            readonly description: "The last time the application environment was seen";
        };
        readonly issues: {
            readonly description: "This list of issues that might be wrong with the application";
            readonly $ref: "#/components/schemas/applicationEnvironmentIssuesSchema";
        };
    };
    readonly components: {
        readonly schemas: {
            readonly applicationEnvironmentIssuesSchema: {
                readonly $id: "#/components/schemas/applicationEnvironmentIssuesSchema";
                readonly type: "object";
                readonly description: "This list of issues that might be wrong with the application";
                readonly additionalProperties: false;
                readonly required: readonly ["missingFeatures", "outdatedSdks"];
                readonly properties: {
                    readonly missingFeatures: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                        readonly description: "The list of features that are missing in Unleash";
                        readonly example: readonly ["feature1", "feature2"];
                    };
                    readonly outdatedSdks: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                        readonly description: "The list of used SDKs that are outdated";
                        readonly example: readonly ["unleash-client-node:5.4.0", "unleash-client-node:5.3.0"];
                    };
                };
                readonly components: {};
            };
        };
    };
};
export type ApplicationOverviewEnvironmentSchema = FromSchema<typeof applicationOverviewEnvironmentSchema>;
//# sourceMappingURL=application-overview-environment-schema.d.ts.map