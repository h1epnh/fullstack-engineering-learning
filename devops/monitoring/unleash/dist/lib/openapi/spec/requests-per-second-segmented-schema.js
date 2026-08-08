"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestsPerSecondSegmentedSchema = void 0;
const requests_per_second_schema_1 = require("./requests-per-second-schema");
exports.requestsPerSecondSegmentedSchema = {
    $id: '#/components/schemas/requestsPerSecondSegmentedSchema',
    type: 'object',
    description: 'Get usage metrics separated by client and admin paths',
    properties: {
        clientMetrics: {
            $ref: '#/components/schemas/requestsPerSecondSchema',
        },
        adminMetrics: {
            $ref: '#/components/schemas/requestsPerSecondSchema',
        },
    },
    components: {
        schemas: {
            requestsPerSecondSchema: requests_per_second_schema_1.requestsPerSecondSchema,
        },
    },
};
//# sourceMappingURL=requests-per-second-segmented-schema.js.map