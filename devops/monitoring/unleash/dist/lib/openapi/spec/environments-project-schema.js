"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.environmentsProjectSchema = void 0;
const environment_project_schema_1 = require("./environment-project-schema");
exports.environmentsProjectSchema = {
    $id: '#/components/schemas/environmentsProjectSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'environments'],
    description: 'Environments defined for a given project',
    properties: {
        version: {
            type: 'integer',
            example: 1,
            description: 'Version of the environments schema',
        },
        environments: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/environmentProjectSchema',
            },
            description: 'List of environments',
        },
    },
    components: {
        schemas: {
            environmentProjectSchema: environment_project_schema_1.environmentProjectSchema,
        },
    },
};
//# sourceMappingURL=environments-project-schema.js.map