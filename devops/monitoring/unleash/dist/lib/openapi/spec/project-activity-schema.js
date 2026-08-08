"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectActivitySchema = void 0;
exports.projectActivitySchema = {
    $id: '#/components/schemas/projectActivitySchema',
    type: 'array',
    description: 'An array of project activity information. Each item contains a date and the total number of activities for that date.',
    items: {
        type: 'object',
        additionalProperties: false,
        required: ['date', 'count'],
        properties: {
            date: {
                type: 'string',
                example: '2022-12-14',
                description: 'Activity date',
            },
            count: {
                type: 'integer',
                minimum: 0,
                description: 'Activity count',
            },
        },
    },
    components: {
        schemas: {},
    },
};
//# sourceMappingURL=project-activity-schema.js.map