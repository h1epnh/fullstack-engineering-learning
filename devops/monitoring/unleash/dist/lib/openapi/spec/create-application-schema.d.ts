import type { FromSchema } from 'json-schema-to-ts';
export declare const createApplicationSchema: {
    readonly $id: "#/components/schemas/createApplicationSchema";
    readonly type: "object";
    readonly description: "Reported application information from Unleash SDKs";
    readonly properties: {
        readonly appName: {
            readonly description: "Name of the application";
            readonly type: "string";
            readonly example: "accounting";
        };
        readonly sdkVersion: {
            readonly description: "Which SDK and version the application reporting uses. Typically represented as `<identifier>:<version>`";
            readonly type: "string";
            readonly example: "unleash-client-java:8.0.0";
        };
        readonly strategies: {
            readonly description: "Which [strategies](https://docs.getunleash.io/topics/the-anatomy-of-unleash#activation-strategies) the application has loaded. Useful when trying to figure out if your [custom strategy](https://docs.getunleash.io/reference/custom-activation-strategies) has been loaded in the SDK";
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly example: readonly ["standard", "gradualRollout", "mySpecialCustomStrategy"];
        };
        readonly url: {
            readonly description: "A link to reference the application reporting the metrics. Could for instance be a GitHub link to the repository of the application";
            readonly type: "string";
            readonly example: "https://github.com/Unleash/unleash-proxy-client-js";
        };
        readonly color: {
            readonly description: "Css color to be used to color the application's entry in the application list";
            readonly type: "string";
            readonly example: "red";
        };
        readonly icon: {
            readonly description: "An URL to an icon file to be used for the applications's entry in the application list";
            readonly type: "string";
            readonly example: "https://github.com/favicon.ico";
        };
    };
    readonly components: {};
};
export type CreateApplicationSchema = FromSchema<typeof createApplicationSchema>;
//# sourceMappingURL=create-application-schema.d.ts.map