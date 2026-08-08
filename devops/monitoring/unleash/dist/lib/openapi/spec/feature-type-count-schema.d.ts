import type { FromSchema } from 'json-schema-to-ts';
export declare const featureTypeCountSchema: {
    readonly $id: "#/components/schemas/featureTypeCountSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["type", "count"];
    readonly description: "A count of feature flags of a specific type";
    readonly properties: {
        readonly type: {
            readonly type: "string";
            readonly example: "kill-switch";
            readonly description: "Type of the flag e.g. experiment, kill-switch, release, operational, permission";
        };
        readonly count: {
            readonly type: "number";
            readonly example: 1;
            readonly description: "Number of feature flags of this type";
        };
    };
    readonly components: {
        readonly schemas: {};
    };
};
export type FeatureTypeCountSchema = FromSchema<typeof featureTypeCountSchema>;
//# sourceMappingURL=feature-type-count-schema.d.ts.map