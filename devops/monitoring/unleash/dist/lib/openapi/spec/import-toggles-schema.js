"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importTogglesSchema = void 0;
const export_result_schema_1 = require("./export-result-schema");
const feature_schema_1 = require("./feature-schema");
const feature_strategy_schema_1 = require("./feature-strategy-schema");
const context_field_schema_1 = require("./context-field-schema");
const feature_tag_schema_1 = require("./feature-tag-schema");
const segment_schema_1 = require("./segment-schema");
const variants_schema_1 = require("./variants-schema");
const variant_schema_1 = require("./variant-schema");
const override_schema_1 = require("./override-schema");
const constraint_schema_1 = require("./constraint-schema");
const parameters_schema_1 = require("./parameters-schema");
const legal_value_schema_1 = require("./legal-value-schema");
const tag_type_schema_1 = require("./tag-type-schema");
const feature_environment_schema_1 = require("./feature-environment-schema");
const strategy_variant_schema_1 = require("./strategy-variant-schema");
const feature_dependencies_schema_1 = require("./feature-dependencies-schema");
const dependent_feature_schema_1 = require("./dependent-feature-schema");
exports.importTogglesSchema = {
    $id: '#/components/schemas/importTogglesSchema',
    type: 'object',
    required: ['project', 'environment', 'data'],
    additionalProperties: false,
    description: 'The result of the export operation for a project and environment, used at import',
    properties: {
        project: {
            type: 'string',
            example: 'My awesome project',
            description: 'The exported [project](https://docs.getunleash.io/reference/projects)',
        },
        environment: {
            type: 'string',
            example: 'development',
            description: 'The exported [environment](https://docs.getunleash.io/reference/environments)',
        },
        data: {
            $ref: '#/components/schemas/exportResultSchema',
        },
    },
    components: {
        schemas: {
            exportResultSchema: export_result_schema_1.exportResultSchema,
            featureSchema: feature_schema_1.featureSchema,
            featureStrategySchema: feature_strategy_schema_1.featureStrategySchema,
            strategyVariantSchema: strategy_variant_schema_1.strategyVariantSchema,
            featureEnvironmentSchema: feature_environment_schema_1.featureEnvironmentSchema,
            contextFieldSchema: context_field_schema_1.contextFieldSchema,
            featureTagSchema: feature_tag_schema_1.featureTagSchema,
            segmentSchema: segment_schema_1.segmentSchema,
            variantsSchema: variants_schema_1.variantsSchema,
            variantSchema: variant_schema_1.variantSchema,
            overrideSchema: override_schema_1.overrideSchema,
            constraintSchema: constraint_schema_1.constraintSchema,
            parametersSchema: parameters_schema_1.parametersSchema,
            legalValueSchema: legal_value_schema_1.legalValueSchema,
            tagTypeSchema: tag_type_schema_1.tagTypeSchema,
            featureDependenciesSchema: feature_dependencies_schema_1.featureDependenciesSchema,
            dependentFeatureSchema: dependent_feature_schema_1.dependentFeatureSchema,
        },
    },
};
//# sourceMappingURL=import-toggles-schema.js.map