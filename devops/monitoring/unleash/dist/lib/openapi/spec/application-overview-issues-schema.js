"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationOverviewIssuesSchema = void 0;
exports.applicationOverviewIssuesSchema = {
    $id: '#/components/schemas/applicationOverviewIssuesSchema',
    type: 'object',
    description: 'This list of issues that might be wrong with the application',
    additionalProperties: false,
    required: ['missingStrategies'],
    properties: {
        missingStrategies: {
            type: 'array',
            items: {
                type: 'string',
            },
            description: 'The list of strategies that are missing from Unleash',
            example: ['feature1', 'feature2'],
        },
    },
    components: {},
};
//# sourceMappingURL=application-overview-issues-schema.js.map