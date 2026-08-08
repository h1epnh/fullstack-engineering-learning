"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.environmentsSchema = void 0;
const environment_schema_1 = require("./environment-schema");
exports.environmentsSchema = {
    $id: '#/components/schemas/environmentsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'environments'],
    description: 'A versioned list of environments',
    properties: {
        version: {
            type: 'integer',
            example: 1,
            description: 'Version of the environments schema',
        },
        environments: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/environmentSchema',
            },
            description: 'List of environments',
        },
    },
    components: {
        schemas: {
            environmentSchema: environment_schema_1.environmentSchema,
        },
    },
};
//# sourceMappingURL=environments-schema.js.map