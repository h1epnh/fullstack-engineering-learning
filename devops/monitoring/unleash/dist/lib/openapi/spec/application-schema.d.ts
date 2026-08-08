import type { FromSchema } from 'json-schema-to-ts';
export declare const applicationSchema: {
    readonly $id: "#/components/schemas/applicationSchema";
    readonly type: "object";
    readonly description: "Data about an application that's connected to Unleash via an SDK.";
    readonly additionalProperties: false;
    readonly required: readonly ["appName"];
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
        readonly description: {
            readonly description: "Extra information added about the application reporting the metrics. Only present if added via the Unleash Admin interface";
            readonly type: "string";
            readonly example: "Application for reporting page visits";
        };
        readonly url: {
            readonly description: "A link to reference the application reporting the metrics. Could for instance be a GitHub link to the repository of the application";
            readonly type: "string";
            readonly example: "https://github.com/Unleash/unleash-proxy-client-js";
        };
        readonly color: {
            readonly description: "The CSS color that is used to color the application's entry in the application list";
            readonly type: "string";
            readonly example: "red";
        };
        readonly icon: {
            readonly description: "An URL to an icon file to be used for the applications's entry in the application list";
            readonly type: "string";
            readonly example: "https://github.com/favicon.ico";
        };
        readonly usage: {
            readonly description: "The list of projects the application has been using.";
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/components/schemas/applicationUsageSchema";
            };
        };
    };
    readonly components: {
        readonly applicationUsageSchema: {
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
    };
};
export type ApplicationSchema = FromSchema<typeof applicationSchema>;
//# sourceMappingURL=application-schema.d.ts.map