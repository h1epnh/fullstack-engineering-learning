"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategiesSchema = void 0;
const strategy_schema_1 = require("./strategy-schema");
exports.strategiesSchema = {
    $id: '#/components/schemas/strategiesSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'strategies'],
    description: 'List of strategies',
    properties: {
        version: {
            type: 'integer',
            enum: [1],
            example: 1,
            description: 'Version of the strategies schema',
        },
        strategies: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/strategySchema',
            },
            description: 'List of strategies',
        },
    },
    components: {
        schemas: {
            strategySchema: strategy_schema_1.strategySchema,
        },
    },
};
//# sourceMappingURL=strategies-schema.js.map