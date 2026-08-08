import type { FromSchema } from 'json-schema-to-ts';
export declare const feedbackCreateSchema: {
    readonly $id: "#/components/schemas/feedbackCreateSchema";
    readonly required: readonly ["feedbackId"];
    readonly type: "object";
    readonly description: "User feedback information to be created.";
    readonly properties: {
        readonly neverShow: {
            readonly description: "`true` if the user has asked never to see this feedback questionnaire again. Defaults to `false`.";
            readonly type: "boolean";
            readonly example: false;
        };
        readonly feedbackId: {
            readonly description: "The name of the feedback session";
            readonly type: "string";
            readonly example: "pnps";
        };
    };
    readonly components: {};
};
export type FeedbackCreateSchema = FromSchema<typeof feedbackCreateSchema>;
//# sourceMappingURL=feedback-create-schema.d.ts.map