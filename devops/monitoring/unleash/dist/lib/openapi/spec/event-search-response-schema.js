"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventSearchResponseSchema = void 0;
const event_schema_1 = require("./event-schema");
const tag_schema_1 = require("./tag-schema");
exports.eventSearchResponseSchema = {
    $id: '#/components/schemas/eventsSearchResponseSchema',
    type: 'object',
    additionalProperties: false,
    required: ['events', 'total'],
    description: 'A list of events that have been registered by the system',
    properties: {
        events: {
            description: 'The list of events',
            type: 'array',
            items: { $ref: event_schema_1.eventSchema.$id },
        },
        total: {
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
//# sourceMappingURL=event-search-response-schema.js.map