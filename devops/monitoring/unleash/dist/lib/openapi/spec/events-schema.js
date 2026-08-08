"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventsSchema = void 0;
const event_schema_1 = require("./event-schema");
const tag_schema_1 = require("./tag-schema");
exports.eventsSchema = {
    $id: '#/components/schemas/eventsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'events'],
    description: 'A list of events that has happened in the system',
    properties: {
        version: {
            type: 'integer',
            minimum: 1,
            enum: [1],
            description: 'The api version of this response. A natural increasing number. Only increases if format changes',
            example: 1,
        },
        events: {
            description: 'The list of events',
            type: 'array',
            items: { $ref: event_schema_1.eventSchema.$id },
        },
        totalEvents: {
            type: 'integer',
            description: 'The total count of events',
            minimum: 0,
            example: 842,
        },
    },
    components: {
        schemas: {
            eventSchema: event_schema_1.eventSchema,
            tagSchema: tag_schema_1.tagSchema,
        },
    },
};
//# sourceMappingURL=events-schema.js.map