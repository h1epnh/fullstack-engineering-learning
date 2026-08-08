"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectApplicationsSchema = void 0;
const project_application_schema_1 = require("./project-application-schema");
const project_application_sdk_schema_1 = require("./project-application-sdk-schema");
exports.projectApplicationsSchema = {
    $id: '#/components/schemas/projectApplicationsSchema',
    type: 'object',
    description: 'A list of project applications',
    required: ['total', 'applications'],
    properties: {
        total: {
            type: 'integer',
            example: 50,
            description: 'The total number of project applications.',
        },
        applications: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/projectApplicationSchema',
            },
            description: 'All applications defined for a specific project.',
        },
    },
    components: {
        schemas: {
            projectApplicationSchema: project_application_schema_1.projectApplicationSchema,
            projectApplicationSdkSchema: project_application_sdk_schema_1.projectApplicationSdkSchema,
        },
    },
};
//# sourceMappingURL=project-applications-schema.js.map