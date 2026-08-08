"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkMetricsSchema = void 0;
const bulk_registration_schema_1 = require("./bulk-registration-schema");
const date_schema_1 = require("./date-schema");
const client_metrics_env_schema_1 = require("./client-metrics-env-schema");
exports.bulkMetricsSchema = {
    $id: '#/components/schemas/bulkMetricsSchema',
    type: 'object',
    required: ['applications', 'metrics'],
    description: 'A batch of metrics accumulated by Edge (or other compatible applications). Includes both application registrations as well usage metrics from clients',
    properties: {
        applications: {
            description: 'A list of applications registered by an Unleash SDK',
            type: 'array',
            items: {
                $ref: '#/components/schemas/bulkRegistrationSchema',
            },
        },
        metrics: {
            description: 'a list of client usage metrics registered by downstream providers. (Typically Unleash Edge)',
            type: 'array',
            items: {
                $ref: '#/components/schemas/clientMetricsEnvSchema',
            },
        },
    },
    components: {
        schemas: {
            bulkRegistrationSchema: bulk_registration_schema_1.bulkRegistrationSchema,
            dateSchema: date_schema_1.dateSchema,
            clientMetricsEnvSchema: client_metrics_env_schema_1.clientMetricsEnvSchema,
        },
    },
};
//# sourceMappingURL=bulk-metrics-schema.js.map