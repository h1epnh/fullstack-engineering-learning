"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advancedPlaygroundRequestSchema = void 0;
const api_token_1 = require("../../types/models/api-token");
const sdk_context_schema_1 = require("./sdk-context-schema");
exports.advancedPlaygroundRequestSchema = {
    $id: '#/components/schemas/advancedPlaygroundRequestSchema',
    description: 'Data for the playground API to evaluate toggles in advanced mode with environment and context multi selection',
    type: 'object',
    required: ['environments', 'context'],
    properties: {
        environments: {
            type: 'array',
            items: {
                type: 'string',
                minLength: 1,
                pattern: '^[a-zA-Z0-9~_.-]+$',
            },
            minItems: 1,
            example: ['development', 'production'],
            description: 'The environments to evaluate toggles in.',
        },
        projects: {
            description: 'A list of projects to check for toggles in.',
            oneOf: [
                {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['my-project'],
                    description: 'A list of projects to check for toggles in.',
                },
                {
                    type: 'string',
                    enum: [api_token_1.ALL],
                    description: 'Check toggles in all projects.',
                },
            ],
        },
        context: {
            $ref: sdk_context_schema_1.sdkContextSchema.$id,
        },
    },
    components: {
        schemas: {
            sdkContextSchema: sdk_context_schema_1.sdkContextSchema,
        },
    },
};
//# sourceMappingURL=advanced-playground-request-schema.js.map