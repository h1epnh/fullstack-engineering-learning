import type { FromSchema } from 'json-schema-to-ts';
export declare const feedbackResponseSchema: {
    readonly $id: "#/components/schemas/feedbackResponseSchema";
    readonly additionalProperties: false;
    readonly type: "object";
    readonly description: "User feedback information about a particular feedback item.";
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
        readonly feedbackId: {
            readonly description: "The name of the feedback session";
            readonly type: "string";
            readonly example: "pnps";
        };
    };
    readonly components: {};
};
export type FeedbackResponseSchema = FromSchema<typeof feedbackResponseSchema>;
//# sourceMappingURL=feedback-response-schema.d.ts.map