"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthReportSchema = void 0;
const health_overview_schema_1 = require("./health-overview-schema");
exports.healthReportSchema = {
    ...health_overview_schema_1.healthOverviewSchema,
    $id: '#/components/schemas/healthReportSchema',
    description: 'A report of the current health of the requested project, with datapoints like counters of currently active, stale, and potentially stale feature flags.',
    required: [
        ...health_overview_schema_1.healthOverviewSchema.required,
        'potentiallyStaleCount',
        'activeCount',
        'staleCount',
    ],
    properties: {
        ...health_overview_schema_1.healthOverviewSchema.properties,
        potentiallyStaleCount: {
            type: 'number',
            description: 'The number of potentially stale feature flags.',
            example: 5,
        },
        activeCount: {
            type: 'number',
            description: 'The number of active feature flags.',
            example: 2,
        },
        staleCount: {
            type: 'number',
            description: 'The number of stale feature flags.',
            example: 10,
        },
    },
};
//# sourceMappingURL=health-report-schema.js.map