"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchFeaturesSchema = void 0;
const parameters_schema_1 = require("./parameters-schema");
const variant_schema_1 = require("./variant-schema");
const override_schema_1 = require("./override-schema");
const feature_strategy_schema_1 = require("./feature-strategy-schema");
const constraint_schema_1 = require("./constraint-schema");
const strategy_variant_schema_1 = require("./strategy-variant-schema");
const tag_schema_1 = require("./tag-schema");
const feature_search_response_schema_1 = require("./feature-search-response-schema");
const feature_search_environment_schema_1 = require("./feature-search-environment-schema");
exports.searchFeaturesSchema = {
    $id: '#/components/schemas/searchFeaturesSchema',
    type: 'object',
    additionalProperties: false,
    required: ['features'],
    description: 'A list of features matching search and filter criteria.',
    properties: {
        features: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureSearchResponseSchema',
            },
            description: 'The full list of features in this project matching search and filter criteria.',
        },
        total: {
            type: 'number',
            description: 'Total count of the features matching search and filter criteria',
            example: 10,
        },
    },
    components: {
        schemas: {
            featureSearchEnvironmentSchema: feature_search_environment_schema_1.featureSearchEnvironmentSchema,
            featureSearchResponseSchema: feature_search_response_schema_1.featureSearchResponseSchema,
            constraintSchema: constraint_schema_1.constraintSchema,
            featureStrategySchema: feature_strategy_schema_1.featureStrategySchema,
            strategyVariantSchema: strategy_variant_schema_1.strategyVariantSchema,
            overrideSchema: override_schema_1.overrideSchema,
            parametersSchema: parameters_schema_1.parametersSchema,
            variantSchema: variant_schema_1.variantSchema,
            tagSchema: tag_schema_1.tagSchema,
        },
    },
};
//# sourceMappingURL=search-features-schema.js.map