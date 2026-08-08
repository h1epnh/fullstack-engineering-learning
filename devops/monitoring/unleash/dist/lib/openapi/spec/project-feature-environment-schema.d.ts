import type { FromSchema } from 'json-schema-to-ts';
export declare const projectFeatureEnvironmentSchema: {
    readonly $id: "#/components/schemas/projectFeatureEnvironmentSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["name", "type", "enabled", "sortOrder", "variantCount", "lastSeenAt"];
    readonly description: "A detailed description of the feature environment";
    readonly properties: {
        readonly name: {
            readonly type: "string";
            readonly example: "my-dev-env";
            readonly description: "The name of the environment";
        };
        readonly type: {
            readonly type: "string";
            readonly example: "development";
            readonly description: "The type of the environment";
        };
        readonly enabled: {
            readonly type: "boolean";
            readonly example: true;
            readonly description: "`true` if the feature is enabled for the environment, otherwise `false`.";
        };
        readonly sortOrder: {
            readonly type: "number";
            readonly example: 3;
            readonly description: "The sort order of the feature environment in the feature environments list";
        };
        readonly variantCount: {
            readonly type: "number";
            readonly description: "The number of defined variants";
        };
        readonly lastSeenAt: {
            readonly type: "string";
            readonly format: "date-time";
            readonly nullable: true;
            readonly example: "2023-01-28T16:21:39.975Z";
            readonly description: "The date when metrics where last collected for the feature environment";
        };
        readonly hasStrategies: {
            readonly type: "boolean";
            readonly description: "Whether the feature has any strategies defined.";
        };
        readonly hasEnabledStrategies: {
            readonly type: "boolean";
            readonly description: "Whether the feature has any enabled strategies defined.";
        };
    };
    readonly components: {
        readonly schemas: {};
    };
};
export type ProjectFeatureEnvironmentSchema = FromSchema<typeof projectFeatureEnvironmentSchema>;
//# sourceMappingURL=project-feature-environment-schema.d.ts.map