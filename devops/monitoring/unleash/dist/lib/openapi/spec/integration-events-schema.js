"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrationEventsSchema = void 0;
const event_schema_1 = require("./event-schema");
const tag_schema_1 = require("./tag-schema");
const variant_schema_1 = require("./variant-schema");
const integration_event_schema_1 = require("./integration-event-schema");
exports.integrationEventsSchema = {
    $id: '#/components/schemas/integrationEventsSchema',
    description: 'A response model with a list of integration events.',
    type: 'object',
    additionalProperties: false,
    required: ['integrationEvents'],
    properties: {
        integrationEvents: {
            type: 'array',
            description: 'A list of integration events.',
            items: {
                $ref: integration_event_schema_1.integrationEventSchema.$id,
            },
        },
    },
    components: {
        schemas: {
            integrationEventSchema: integration_event_schema_1.integrationEventSchema,
            eventSchema: event_schema_1.eventSchema,
            tagSchema: tag_schema_1.tagSchema,
            variantSchema: variant_schema_1.variantSchema,
        },
    },
};
//# sourceMappingURL=integration-events-schema.js.map