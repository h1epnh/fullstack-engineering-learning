"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectInsightsSchema = void 0;
const project_stats_schema_1 = require("./project-stats-schema");
const feature_type_count_schema_1 = require("./feature-type-count-schema");
const dora_features_schema_1 = require("./dora-features-schema");
const project_dora_metrics_schema_1 = require("./project-dora-metrics-schema");
exports.projectInsightsSchema = {
    $id: '#/components/schemas/projectInsightsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['stats', 'leadTime', 'featureTypeCounts', 'health', 'members'],
    description: 'A high-level overview of a project insights. It contains information such as project statistics, overall health, types of flags, members overview, change requests overview.',
    properties: {
        stats: {
            $ref: '#/components/schemas/projectStatsSchema',
            description: 'Project statistics',
        },
        health: {
            type: 'object',
            required: [
                'rating',
                'activeCount',
                'potentiallyStaleCount',
                'staleCount',
            ],
            properties: {
                rating: {
                    type: 'integer',
                    description: "An indicator of the [project's health](https://docs.getunleash.io/reference/technical-debt#project-status) on a scale from 0 to 100",
                    example: 95,
                },
                activeCount: {
                    type: 'number',
                    description: 'The number of active feature flags.',
                    example: 12,
                },
                potentiallyStaleCount: {
                    type: 'number',
                    description: 'The number of potentially stale feature flags.',
                    example: 5,
                },
                staleCount: {
                    type: 'number',
                    description: 'The number of stale feature flags.',
                    example: 10,
                },
            },
            description: 'Health summary of the project',
        },
        leadTime: {
            type: 'object',
            $ref: '#/components/schemas/projectDoraMetricsSchema',
            description: 'Lead time (DORA) metrics',
        },
        featureTypeCounts: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureTypeCountSchema',
            },
            description: 'The number of features of each type',
        },
        members: {
            type: 'object',
            required: ['currentMembers', 'change'],
            properties: {
                currentMembers: {
                    type: 'number',
                    description: 'The number of total project members',
                    example: 10,
                },
                change: {
                    type: 'number',
                    description: 'The change in the number of project members compared to the previous month',
                    example: 10,
                },
            },
            description: 'Active/inactive users summary',
        },
    },
    components: {
        schemas: {
            projectStatsSchema: project_stats_schema_1.projectStatsSchema,
            featureTypeCountSchema: feature_type_count_schema_1.featureTypeCountSchema,
            projectDoraMetricsSchema: project_dora_metrics_schema_1.projectDoraMetricsSchema,
            doraFeaturesSchema: dora_features_schema_1.doraFeaturesSchema,
        },
    },
};
//# sourceMappingURL=project-insights-schema.js.map