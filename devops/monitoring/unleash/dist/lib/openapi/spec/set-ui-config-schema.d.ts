import type { FromSchema } from 'json-schema-to-ts';
export declare const setUiConfigSchema: {
    readonly $id: "#/components/schemas/setUiConfigSchema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly description: "Unleash configuration settings affect the admin UI.";
    readonly properties: {
        readonly frontendSettings: {
            readonly type: "object";
            readonly description: "Settings related to the front-end API.";
            readonly additionalProperties: false;
            readonly required: readonly ["frontendApiOrigins"];
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
        };
    };
    readonly components: {};
};
export type SetUiConfigSchema = FromSchema<typeof setUiConfigSchema>;
//# sourceMappingURL=set-ui-config-schema.d.ts.map