import type { FromSchema } from 'json-schema-to-ts';
export declare const applicationEnvironmentInstancesSchema: {
    readonly $id: "#/components/schemas/applicationEnvironmentInstanceSchema";
    readonly type: "object";
    readonly description: "Data about an application environment instances that are connected to Unleash via an SDK.";
    readonly additionalProperties: false;
    readonly required: readonly ["instances"];
    readonly properties: {
        readonly instances: {
            readonly type: "array";
            readonly description: "A list of instances";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["instanceId"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly instanceId: {
                        readonly description: "A unique identifier identifying the instance of the application running the SDK. Often changes based on execution environment. For instance: two pods in Kubernetes will have two different instanceIds";
                        readonly type: "string";
                        readonly example: "b77f3d13-5f48-4a7b-a3f4-a449b97ce43a";
                    };
                    readonly sdkVersion: {
                        readonly type: "string";
                        readonly nullable: true;
                        readonly description: "An SDK version identifier. Usually formatted as \"unleash-client-<language>:<version>\"";
                        readonly example: "unleash-client-java:7.0.0";
                    };
                    readonly clientIp: {
                        readonly type: "string";
                        readonly description: "An IP address identifying the instance of the application running the SDK";
                        readonly example: "192.168.0.1";
                    };
                    readonly lastSeen: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly example: "2023-04-19T08:15:14.000Z";
                        readonly description: "The last time the application environment instance was seen";
                    };
                };
            };
        };
    };
    readonly components: {};
};
export type ApplicationEnvironmentInstancesSchema = FromSchema<typeof applicationEnvironmentInstancesSchema>;
//# sourceMappingURL=application-environment-instances-schema.d.ts.map