"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationEnvironmentIssuesSchema = void 0;
exports.applicationEnvironmentIssuesSchema = {
    $id: '#/components/schemas/applicationEnvironmentIssuesSchema',
    type: 'object',
    description: 'This list of issues that might be wrong with the application',
    additionalProperties: false,
    required: ['missingFeatures', 'outdatedSdks'],
    properties: {
        missingFeatures: {
            type: 'array',
            items: {
                type: 'string',
            },
            description: 'The list of features that are missing in Unleash',
            example: ['feature1', 'feature2'],
        },
        outdatedSdks: {
            type: 'array',
            items: {
                type: 'string',
            },
            description: 'The list of used SDKs that are outdated',
            example: ['unleash-client-node:5.4.0', 'unleash-client-node:5.3.0'],
        },
    },
    components: {},
};
//# sourceMappingURL=application-environment-issues-schema.js.map