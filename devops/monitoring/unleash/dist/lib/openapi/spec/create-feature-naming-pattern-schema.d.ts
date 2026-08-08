import type { FromSchema } from 'json-schema-to-ts';
export declare const createFeatureNamingPatternSchema: {
    readonly $id: "#/components/schemas/createFeatureNamingPatternSchema";
    readonly type: "object";
    readonly description: "Create a feature naming pattern";
    readonly required: readonly ["pattern"];
    readonly properties: {
        readonly pattern: {
            readonly type: "string";
            readonly nullable: true;
            readonly description: "A JavaScript regular expression pattern, without the start and end delimiters. Optional flags are not allowed.";
            readonly example: "^[A-Za-z]+\\.[A-Za-z]+\\.[A-Za-z0-9-]+$";
        };
        readonly example: {
            readonly type: "string";
            readonly nullable: true;
            readonly description: "An example of a feature name that matches the pattern. Must itself match the pattern supplied.";
            readonly example: "dx.feature1.1-135";
        };
        readonly description: {
            readonly type: "string";
            readonly nullable: true;
            readonly description: "A description of the pattern in a human-readable format. Will be shown to users when they create a new feature flag.";
            readonly example: "<project>.<featureName>.<ticket>\n\nThe flag name should contain the project name, the feature name, and the ticket number, each separated by a dot.";
        };
    };
    readonly components: {};
};
export type CreateFeatureNamingPatternSchema = FromSchema<typeof createFeatureNamingPatternSchema>;
//# sourceMappingURL=create-feature-naming-pattern-schema.d.ts.map