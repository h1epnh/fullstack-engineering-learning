import type { FromSchema } from 'json-schema-to-ts';
export declare const setCorsSchema: {
    readonly $id: "#/components/schemas/setCorsSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly description: "Unleash CORS configuration.";
    readonly properties: {
        readonly frontendApiOrigins: {
            readonly description: "The list of origins that the front-end API should accept requests from.";
            readonly example: readonly ["*"];
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
    };
    readonly components: {};
};
export type SetCorsSchema = FromSchema<typeof setCorsSchema>;
//# sourceMappingURL=set-cors-schema.d.ts.map