"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationsSchema = void 0;
const application_schema_1 = require("./application-schema");
const application_usage_schema_1 = require("./application-usage-schema");
exports.applicationsSchema = {
    $id: '#/components/schemas/applicationsSchema',
    additionalProperties: false,
    description: 'An object containing a list of applications that have connected to Unleash via an SDK.',
    required: ['total', 'applications'],
    type: 'object',
    properties: {
        total: {
            type: 'integer',
            example: 50,
            description: 'The total number of project applications.',
        },
        applications: {
            description: 'The list of applications that have connected to this Unleash instance.',
            type: 'array',
            items: {
                $ref: '#/components/schemas/applicationSchema',
            },
        },
    },
    components: {
        schemas: {
            applicationSchema: application_schema_1.applicationSchema,
            applicationUsageSchema: application_usage_schema_1.applicationUsageSchema,
        },
    },
};
//# sourceMappingURL=applications-schema.js.map