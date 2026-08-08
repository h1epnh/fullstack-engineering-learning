import type { FromSchema } from 'json-schema-to-ts';
export declare const eventCreatorsSchema: {
    readonly $id: "#/components/schemas/eventCreatorsSchema";
    readonly type: "array";
    readonly description: "A list of event creators";
    readonly items: {
        readonly type: "object";
        readonly additionalProperties: false;
        readonly required: readonly ["id", "name"];
        readonly properties: {
            readonly id: {
                readonly type: "integer";
                readonly example: 50;
                readonly description: "The user id.";
            };
            readonly name: {
                readonly description: "Name of the user. If the user has no set name, the API falls back to using the user's username (if they have one) or email (if neither name or username is set).";
                readonly type: "string";
                readonly example: "User";
            };
        };
    };
    readonly components: {
        readonly schemas: {};
    };
};
export type EventCreatorsSchema = FromSchema<typeof eventCreatorsSchema>;
//# sourceMappingURL=event-creators-schema.d.ts.map