import type { FromSchema } from 'json-schema-to-ts';
export declare const clientFeaturesQuerySchema: {
    readonly $id: "#/components/schemas/clientFeaturesQuerySchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly description: "Query parameters active for a client features request";
    readonly properties: {
        readonly tag: {
            readonly type: "array";
            readonly description: "Features tagged with one of these tags are included";
            readonly items: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
            };
            readonly example: readonly [readonly ["simple:payment", "simple:stripejourney"]];
        };
        readonly project: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly description: "Features that are part of these projects are included in this response. This is now handled by API tokens and was marked as deprecated in v5";
            readonly example: readonly ["new.payment.flow"];
            readonly deprecated: true;
        };
        readonly namePrefix: {
            readonly description: "Features are filtered to only include features whose name starts with this prefix";
            readonly type: "string";
            readonly example: "payment";
        };
        readonly environment: {
            readonly type: "string";
            readonly description: "Strategies for the feature flag configured for this environment are included. This is now handled by API tokens and was marked as deprecated in v5";
            readonly deprecated: true;
        };
        readonly inlineSegmentConstraints: {
            readonly description: "Set to true if requesting client does not support Unleash-Client-Specification 4.2.2 or newer. Modern SDKs will have this set to false, since they will be able to merge constraints and segments themselves";
            readonly type: "boolean";
            readonly example: true;
        };
    };
    readonly components: {};
};
export type ClientFeaturesQuerySchema = FromSchema<typeof clientFeaturesQuerySchema>;
//# sourceMappingURL=client-features-query-schema.d.ts.map