import type { FromSchema } from 'json-schema-to-ts';
export declare const applicationUsageSchema: {
    readonly $id: "#/components/schemas/applicationUsageSchema";
    readonly type: "object";
    readonly description: "Data about an project that have been used by applications.";
    readonly additionalProperties: false;
    readonly required: readonly ["project", "environments"];
    readonly properties: {
        readonly project: {
            readonly description: "Name of the project";
            readonly type: "string";
            readonly example: "main-project";
        };
        readonly environments: {
            readonly description: "Which environments have been accessed in this project.";
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly example: readonly ["development", "production"];
        };
    };
    readonly components: {};
};
export type ApplicationUsageSchema = FromSchema<typeof applicationUsageSchema>;
//# sourceMappingURL=application-usage-schema.d.ts.map