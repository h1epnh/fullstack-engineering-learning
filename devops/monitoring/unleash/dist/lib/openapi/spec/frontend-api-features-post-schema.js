"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.frontendApiFeaturesPostSchema = void 0;
const sdk_context_schema_1 = require("./sdk-context-schema");
exports.frontendApiFeaturesPostSchema = {
    $id: '#/components/schemas/frontendApiFeaturesPostContextSchema',
    description: 'The Unleash frontend API POST request body.',
    type: 'object',
    additionalProperties: true,
    properties: {
        context: {
            description: 'The Unleash context.',
            type: 'object',
            additionalProperties: true,
            properties: sdk_context_schema_1.sdkContextSchema.properties,
        },
    },
    components: {},
};
//# sourceMappingURL=frontend-api-features-post-schema.js.map