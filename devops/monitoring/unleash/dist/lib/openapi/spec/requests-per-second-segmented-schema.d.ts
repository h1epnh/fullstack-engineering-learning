import type { FromSchema } from 'json-schema-to-ts';
export declare const requestsPerSecondSegmentedSchema: {
    readonly $id: "#/components/schemas/requestsPerSecondSegmentedSchema";
    readonly type: "object";
    readonly description: "Get usage metrics separated by client and admin paths";
    readonly properties: {
        readonly clientMetrics: {
            readonly $ref: "#/components/schemas/requestsPerSecondSchema";
        };
        readonly adminMetrics: {
            readonly $ref: "#/components/schemas/requestsPerSecondSchema";
        };
    };
    readonly components: {
        readonly schemas: {
            readonly requestsPerSecondSchema: {
                readonly $id: "#/components/schemas/requestsPerSecondSchema";
                readonly type: "object";
                readonly description: "Statistics for usage of Unleash, formatted so it can easily be used in a graph";
                readonly properties: {
                    readonly status: {
                        readonly type: "string";
                        readonly description: "Whether the query against prometheus succeeded or failed";
                        readonly enum: readonly ["success", "failure"];
                        readonly example: "success";
                    };
                    readonly data: {
                        readonly type: "object";
                        readonly description: "The query result from prometheus";
                        readonly properties: {
                            readonly resultType: {
                                readonly type: "string";
                                readonly description: "Prometheus compatible result type.";
                                readonly enum: readonly ["matrix", "vector", "scalar", "string"];
                                readonly example: "vector";
                            };
                            readonly result: {
                                readonly description: "An array of values per metric. Each one represents a line in the graph labeled by its metric name";
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "object";
                                    readonly description: "A representation of a single metric to build a line in a graph";
                                    readonly properties: {
                                        readonly metric: {
                                            readonly description: "A key value set representing the metric";
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly appName: {
                                                    readonly description: "Name of the application this metric relates to";
                                                    readonly type: "string";
                                                    readonly example: "mySdk";
                                                };
                                                readonly endpoint: {
                                                    readonly description: "Which endpoint has been accessed";
                                                    readonly type: "string";
                                                    readonly example: "/api/frontend";
                                                };
                                            };
                                        };
                                        readonly values: {
                                            readonly description: "An array of arrays. Each element of the array is an array of size 2 consisting of the 2 axis for the graph: in position zero the x axis represented as a number and position one the y axis represented as string";
                                            readonly type: "array";
                                            readonly items: {
                                                readonly type: "array";
                                                readonly description: "Either the x axis represented as a number or the y axis represented as a string";
                                                readonly items: {
                                                    readonly anyOf: readonly [{
                                                        readonly type: "string";
                                                        readonly description: "An identifier for the line in the graph";
                                                    }, {
                                                        readonly type: "number";
                                                        readonly description: "The number of requests at this point in time";
                                                    }];
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
                readonly components: {};
            };
        };
    };
};
export type RequestsPerSecondSegmentedSchema = FromSchema<typeof requestsPerSecondSegmentedSchema>;
//# sourceMappingURL=requests-per-second-segmented-schema.d.ts.map