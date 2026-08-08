import type { FromSchema } from 'json-schema-to-ts';
export declare const feedbackUpdateSchema: {
    readonly $id: "#/components/schemas/feedbackUpdateSchema";
    readonly type: "object";
    readonly description: "User feedback information to be updated.";
    readonly properties: {
        readonly userId: {
            readonly description: "The ID of the user that gave the feedback.";
            readonly type: "integer";
            readonly example: 2;
        };
        readonly neverShow: {
            readonly description: "`true` if the user has asked never to see this feedback questionnaire again.";
            readonly type: "boolean";
            readonly example: false;
        };
        readonly given: {
            readonly description: "When this feedback was given";
            readonly type: "string";
            readonly format: "date-time";
            readonly nullable: true;
            readonly example: "2023-07-06T08:29:21.282Z";
        };
    };
    readonly components: {};
};
export type FeedbackUpdateSchema = FromSchema<typeof feedbackUpdateSchema>;
//# sourceMappingURL=feedback-update-schema.d.ts.map