import type { FromSchema } from 'json-schema-to-ts';
export declare const updateApiTokenSchema: {
    readonly $id: "#/components/schemas/updateApiTokenSchema";
    readonly type: "object";
    readonly required: readonly ["expiresAt"];
    readonly description: "An object with fields to updated for a given API token.";
    readonly properties: {
        readonly expiresAt: {
            readonly description: "The new time when this token should expire.";
            readonly example: "2023-09-04T11:26:24+02:00";
            readonly type: "string";
            readonly format: "date-time";
        };
    };
    readonly components: {};
};
export type UpdateApiTokenSchema = FromSchema<typeof updateApiTokenSchema>;
//# sourceMappingURL=update-api-token-schema.d.ts.map