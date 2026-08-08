import type { FromSchema } from 'json-schema-to-ts';
export declare const projectDoraMetricsSchema: {
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
export type ProjectDoraMetricsSchema = FromSchema<typeof projectDoraMetricsSchema>;
//# sourceMappingURL=project-dora-metrics-schema.d.ts.map