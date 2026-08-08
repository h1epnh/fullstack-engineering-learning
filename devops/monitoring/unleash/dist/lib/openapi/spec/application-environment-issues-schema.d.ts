import type { FromSchema } from 'json-schema-to-ts';
export declare const applicationEnvironmentIssuesSchema: {
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
export type ApplicationEnvironmentIssuesSchema = FromSchema<typeof applicationEnvironmentIssuesSchema>;
//# sourceMappingURL=application-environment-issues-schema.d.ts.map