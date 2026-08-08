"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationOverviewSchema = void 0;
const application_overview_environment_schema_1 = require("./application-overview-environment-schema");
const application_overview_issues_schema_1 = require("./application-overview-issues-schema");
const application_environment_issues_schema_1 = require("./application-environment-issues-schema");
exports.applicationOverviewSchema = {
    $id: '#/components/schemas/applicationOverviewSchema',
    type: 'object',
    description: "Data about an application that's connected to Unleash via an SDK.",
    additionalProperties: false,
    required: ['projects', 'featureCount', 'environments', 'issues'],
    properties: {
        projects: {
            description: 'The list of projects the application has been using.',
            type: 'array',
            items: {
                type: 'string',
            },
            example: ['default', 'payment'],
        },
        featureCount: {
            description: 'The number of features the application has been using.',
            type: 'number',
            example: 5,
        },
        environments: {
            type: 'array',
            description: 'The list of environments the application has been using.',
            items: {
                $ref: '#/components/schemas/applicationOverviewEnvironmentSchema',
            },
        },
        issues: {
            description: 'This list of issues that might be wrong with the application',
            $ref: '#/components/schemas/applicationOverviewIssuesSchema',
        },
    },
    components: {
        schemas: {
            applicationOverviewEnvironmentSchema: application_overview_environment_schema_1.applicationOverviewEnvironmentSchema,
            applicationOverviewIssuesSchema: application_overview_issues_schema_1.applicationOverviewIssuesSchema,
            applicationEnvironmentIssuesSchema: application_environment_issues_schema_1.applicationEnvironmentIssuesSchema,
        },
    },
};
//# sourceMappingURL=application-overview-schema.js.map