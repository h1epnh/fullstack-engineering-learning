import type { FromSchema } from 'json-schema-to-ts';
export declare const splashRequestSchema: {
    readonly $id: "#/components/schemas/splashRequestSchema";
    readonly type: "object";
    readonly description: "Data related to a user having seen a splash screen.";
    readonly required: readonly ["userId", "splashId"];
    readonly properties: {
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
};
export type SplashRequestSchema = FromSchema<typeof splashRequestSchema>;
//# sourceMappingURL=splash-request-schema.d.ts.map