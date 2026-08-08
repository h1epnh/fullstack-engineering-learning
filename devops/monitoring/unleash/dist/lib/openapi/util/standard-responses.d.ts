export declare const emptyResponse: {
    readonly description: "This response has no body.";
};
declare const standardResponses: {
    readonly 400: {
        readonly description: "The request data does not match what we expect.";
        readonly content: {
            readonly 'application/json': {
                readonly schema: {
                    readonly type: "object";
                    readonly properties: {
                        readonly id: {
                            readonly type: "string";
                            readonly example: "9c40958a-daac-400e-98fb-3bb438567008";
                            readonly description: "The ID of the error instance";
                        };
                        readonly name: {
                            readonly type: "string";
                            readonly example: "ValidationError";
                            readonly description: "The name of the error kind";
                        };
                        readonly message: {
                            readonly type: "string";
                            readonly example: "The request payload you provided doesn't conform to the schema. The .parameters property should be object. You sent [].";
                            readonly description: "A description of what went wrong.";
                        };
                    };
                };
            };
        };
    };
    readonly 401: {
        readonly description: "Authorization information is missing or invalid. Provide a valid API token as the `authorization` header, e.g. `authorization:*.*.my-admin-token`.";
        readonly content: {
            readonly 'application/json': {
                readonly schema: {
                    readonly type: "object";
                    readonly properties: {
                        readonly id: {
                            readonly type: "string";
                            readonly example: "9c40958a-daac-400e-98fb-3bb438567008";
                            readonly description: "The ID of the error instance";
                        };
                        readonly name: {
                            readonly type: "string";
                            readonly example: "AuthenticationRequired";
                            readonly description: "The name of the error kind";
                        };
                        readonly message: {
                            readonly type: "string";
                            readonly example: "You must log in to use Unleash. Your request had no authorization header, so we could not authorize you. Try logging in at /auth/simple/login.";
                            readonly description: "A description of what went wrong.";
                        };
                    };
                };
            };
        };
    };
    readonly 403: {
        readonly description: "The provided user credentials are valid, but the user does not have the necessary permissions to perform this operation";
        readonly content: {
            readonly 'application/json': {
                readonly schema: {
                    readonly type: "object";
                    readonly properties: {
                        readonly id: {
                            readonly type: "string";
                            readonly example: "9c40958a-daac-400e-98fb-3bb438567008";
                            readonly description: "The ID of the error instance";
                        };
                        readonly name: {
                            readonly type: "string";
                            readonly example: "NoAccessError";
                            readonly description: "The name of the error kind";
                        };
                        readonly message: {
                            readonly type: "string";
                            readonly example: "You need the \"UPDATE_ADDON\" permission to perform this action in the \"development\" environment.";
                            readonly description: "A description of what went wrong.";
                        };
                    };
                };
            };
        };
    };
    readonly 404: {
        readonly description: "The requested resource was not found.";
        readonly content: {
            readonly 'application/json': {
                readonly schema: {
                    readonly type: "object";
                    readonly properties: {
                        readonly id: {
                            readonly type: "string";
                            readonly example: "9c40958a-daac-400e-98fb-3bb438567008";
                            readonly description: "The ID of the error instance";
                        };
                        readonly name: {
                            readonly type: "string";
                            readonly example: "NotFoundError";
                            readonly description: "The name of the error kind";
                        };
                        readonly message: {
                            readonly type: "string";
                            readonly example: "Could not find the addon with ID \"12345\".";
                            readonly description: "A description of what went wrong.";
                        };
                    };
                };
            };
        };
    };
    readonly 409: {
        readonly description: "The provided resource can not be created or updated because it would conflict with the current state of the resource or with an already existing resource, respectively.";
        readonly content: {
            readonly 'application/json': {
                readonly schema: {
                    readonly type: "object";
                    readonly properties: {
                        readonly id: {
                            readonly type: "string";
                            readonly example: "9c40958a-daac-400e-98fb-3bb438567008";
                            readonly description: "The ID of the error instance";
                        };
                        readonly name: {
                            readonly type: "string";
                            readonly example: "NameExistsError";
                            readonly description: "The name of the error kind";
                        };
                        readonly message: {
                            readonly type: "string";
                            readonly example: "There is already a feature called \"my-awesome-feature\".";
                            readonly description: "A description of what went wrong.";
                        };
                    };
                };
            };
        };
    };
    readonly 413: {
        readonly description: "The request body is larger than what we accept. By default we only accept bodies of 100kB or less";
        readonly content: {
            readonly 'application/json': {
                readonly schema: {
                    readonly type: "object";
                    readonly properties: {
                        readonly id: {
                            readonly type: "string";
                            readonly example: "9c40958a-daac-400e-98fb-3bb438567008";
                            readonly description: "The ID of the error instance";
                        };
                        readonly name: {
                            readonly type: "string";
                            readonly example: "ContentTooLarge";
                            readonly description: "The name of the error kind";
                        };
                        readonly message: {
                            readonly type: "string";
                            readonly example: "You provided more data than we can handle. Unleash accepts at most X MB.";
                            readonly description: "A description of what went wrong.";
                        };
                    };
                };
            };
        };
    };
    readonly 415: {
        readonly description: "The operation does not support request payloads of the provided type. Please ensure that you're using one of the listed payload types and that you have specified the right content type in the \"content-type\" header.";
        readonly content: {
            readonly 'application/json': {
                readonly schema: {
                    readonly type: "object";
                    readonly properties: {
                        readonly id: {
                            readonly type: "string";
                            readonly example: "9c40958a-daac-400e-98fb-3bb438567008";
                            readonly description: "The ID of the error instance";
                        };
                        readonly name: {
                            readonly type: "string";
                            readonly example: "ContentTypeerror";
                            readonly description: "The name of the error kind";
                        };
                        readonly message: {
                            readonly type: "string";
                            readonly example: "We do not accept the content-type you provided (application/xml). Try using one of the content-types we do accept instead (application/json) and make sure the body is in the corresponding format.";
                            readonly description: "A description of what went wrong.";
                        };
                    };
                };
            };
        };
    };
};
type StandardResponses = typeof standardResponses;
export declare const getStandardResponses: (...statusCodes: (keyof StandardResponses)[]) => Partial<StandardResponses>;
export {};
//# sourceMappingURL=standard-responses.d.ts.map