"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategyVariantSchema = void 0;
const create_strategy_variant_schema_1 = require("./create-strategy-variant-schema");
exports.strategyVariantSchema = {
    $id: '#/components/schemas/strategyVariantSchema',
    type: 'object',
    additionalProperties: false,
    description: "This is an experimental property. It may change or be removed as we work on it. Please don't depend on it yet. A strategy variant allows you to attach any data to strategies instead of only returning `true`/`false`. Strategy variants take precedence over feature variants.",
    required: ['name', 'weight', 'weightType', 'stickiness'],
    properties: {
        ...create_strategy_variant_schema_1.createStrategyVariantSchema.properties,
    },
    components: {},
};
//# sourceMappingURL=strategy-variant-schema.js.map