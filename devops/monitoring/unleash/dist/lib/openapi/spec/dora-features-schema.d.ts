import type { FromSchema } from 'json-schema-to-ts';
export declare const doraFeaturesSchema: {
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
export type DoraFeaturesSchema = FromSchema<typeof doraFeaturesSchema>;
//# sourceMappingURL=dora-features-schema.d.ts.map