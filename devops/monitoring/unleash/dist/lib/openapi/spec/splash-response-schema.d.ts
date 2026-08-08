import type { FromSchema } from 'json-schema-to-ts';
export declare const splashResponseSchema: {
    readonly $id: "#/components/schemas/splashResponseSchema";
    readonly additionalProperties: false;
    readonly description: "Data related to a user having seen a splash screen.";
    readonly required: readonly ["userId", "splashId", "seen"];
    readonly properties: {
        readonly seen: {
            readonly type: "boolean";
            readonly description: "Indicates whether the user has seen the splash screen or not.";
            readonly example: true;
        };
        readonly userId: {
            readonly type: "integer";
            readonly description: "The ID of the user that was shown the splash screen.";
            readonly example: 1;
        };
        readonly splashId: {
            readonly type: "string";
            readonly description: "The ID of the splash screen that was shown.";
            readonly example: "new-splash-screen";
        };
    };
    readonly components: {};
    readonly type: "object";
};
export type SplashResponseSchema = FromSchema<typeof splashResponseSchema>;
//# sourceMappingURL=splash-response-schema.d.ts.map