"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectsSchema = void 0;
const project_schema_1 = require("./project-schema");
exports.projectsSchema = {
    $id: '#/components/schemas/projectsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'projects'],
    description: 'An overview of all the projects in the Unleash instance',
    properties: {
        version: {
            type: 'integer',
            description: 'The schema version used to represent the project data.',
            example: 1,
        },
        projects: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/projectSchema',
            },
            description: 'A list of projects in the Unleash instance',
        },
    },
    components: {
        schemas: {
            projectSchema: project_schema_1.projectSchema,
        },
    },
};
//# sourceMappingURL=projects-schema.js.map