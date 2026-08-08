import type { FromSchema } from 'json-schema-to-ts';
export declare const projectActivitySchema: {
    readonly $id: "#/components/schemas/projectActivitySchema";
    readonly type: "array";
    readonly description: "An array of project activity information. Each item contains a date and the total number of activities for that date.";
    readonly items: {
        readonly type: "object";
        readonly additionalProperties: false;
        readonly required: readonly ["date", "count"];
        readonly properties: {
            readonly date: {
                readonly type: "string";
                readonly example: "2022-12-14";
                readonly description: "Activity date";
            };
            readonly count: {
                readonly type: "integer";
                readonly minimum: 0;
                readonly description: "Activity count";
            };
        };
    };
    readonly components: {
        readonly schemas: {};
    };
};
export type ProjectActivitySchema = FromSchema<typeof projectActivitySchema>;
//# sourceMappingURL=project-activity-schema.d.ts.map