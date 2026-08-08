"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureTagSchema = exports.querySchema = exports.featureSchema = exports.featureMetadataSchema = exports.variantsArraySchema = exports.variantsSchema = exports.variantValueSchema = exports.strategiesSchema = exports.constraintSchema = exports.nameSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../util/constants");
const util_1 = require("../routes/util");
const validateJsonString_1 = require("../util/validateJsonString");
exports.nameSchema = joi_1.default
    .object()
    .keys({ name: util_1.nameType })
    .options({ stripUnknown: true, allowUnknown: false, abortEarly: false });
exports.constraintSchema = joi_1.default.object().keys({
    contextName: joi_1.default.string().required(),
    operator: joi_1.default
        .string()
        .valid(...constants_1.ALL_OPERATORS)
        .required(),
    // Constraints must have a values array to support legacy SDKs.
    values: joi_1.default.array().items(joi_1.default.string().min(1).max(100)).default([]),
    value: joi_1.default.optional(),
    caseInsensitive: joi_1.default.boolean().optional(),
    inverted: joi_1.default.boolean().optional(),
});
exports.strategiesSchema = joi_1.default.object().keys({
    id: joi_1.default.string().optional(),
    name: util_1.nameType,
    constraints: joi_1.default.array().allow(null).items(exports.constraintSchema),
    parameters: joi_1.default.object(),
});
exports.variantValueSchema = joi_1.default
    .string()
    .required()
    // perform additional validation
    // when provided 'type' is 'json'
    .when('type', {
    is: 'json',
    then: joi_1.default.custom((val, helper) => {
        const isValidJsonString = (0, validateJsonString_1.validateJsonString)(val);
        if (isValidJsonString === false) {
            return helper.error('invalidJsonString');
        }
        return val;
    }),
})
    .messages({
    invalidJsonString: "'value' must be a valid json string when 'type' is json",
});
exports.variantsSchema = joi_1.default.object().keys({
    name: util_1.nameType,
    weight: joi_1.default
        .number()
        .integer()
        .message('Weight only supports 1 decimal')
        .min(0)
        .max(1000)
        .required(),
    weightType: joi_1.default.string().valid('variable', 'fix').default('variable'),
    payload: joi_1.default
        .object()
        .keys({
        type: joi_1.default.string().required(),
        value: exports.variantValueSchema,
    })
        .optional(),
    stickiness: joi_1.default.string().default('default'),
    overrides: joi_1.default.array().items(joi_1.default
        .object()
        .keys({
        contextName: joi_1.default.string().required(),
        values: joi_1.default.array().items(joi_1.default.string()),
    })
        .optional()),
});
exports.variantsArraySchema = joi_1.default
    .array()
    .min(0)
    .items(exports.variantsSchema)
    .unique((a, b) => a.name === b.name);
exports.featureMetadataSchema = joi_1.default
    .object()
    .keys({
    name: util_1.nameType,
    stale: joi_1.default.boolean().default(false),
    archived: joi_1.default.boolean().default(false),
    type: joi_1.default.string().default('release'),
    description: joi_1.default.string().allow('').allow(null).optional(),
    impressionData: joi_1.default
        .boolean()
        .allow(true)
        .allow(false)
        .default(false)
        .optional(),
    createdAt: joi_1.default.date().optional().allow(null),
    variants: joi_1.default
        .array()
        .allow(null)
        .unique((a, b) => a.name === b.name)
        .optional()
        .items(exports.variantsSchema),
    tags: joi_1.default
        .array()
        .optional()
        .items(joi_1.default.object().keys({
        type: joi_1.default.string().required(),
        value: joi_1.default.string().required(),
    })),
    createdByUserId: joi_1.default.number(),
})
    .options({ allowUnknown: false, stripUnknown: true, abortEarly: false });
exports.featureSchema = joi_1.default
    .object()
    .keys({
    name: util_1.nameType,
    enabled: joi_1.default.boolean().default(false),
    stale: joi_1.default.boolean().default(false),
    archived: joi_1.default.boolean().default(false),
    type: joi_1.default.string().default('release'),
    project: joi_1.default.string().default('default'),
    description: joi_1.default.string().allow('').allow(null).optional(),
    impressionData: joi_1.default
        .boolean()
        .allow(true)
        .allow(false)
        .default(false)
        .optional(),
    strategies: joi_1.default
        .array()
        .min(0)
        .allow(null)
        .optional()
        .items(exports.strategiesSchema),
    variants: joi_1.default
        .array()
        .allow(null)
        .unique((a, b) => a.name === b.name)
        .optional()
        .items(exports.variantsSchema),
})
    .options({ allowUnknown: false, stripUnknown: true, abortEarly: false });
exports.querySchema = joi_1.default
    .object()
    .keys({
    tag: joi_1.default
        .array()
        .allow(null)
        .items(joi_1.default.string().pattern(/\w+:.+/, { name: 'tag' }))
        .optional(),
    project: joi_1.default.array().allow(null).items(util_1.nameType).optional(),
    namePrefix: joi_1.default.string().allow(null).optional(),
    environment: joi_1.default.string().allow(null).optional(),
    inlineSegmentConstraints: joi_1.default.boolean().optional(),
})
    .options({ allowUnknown: false, stripUnknown: true, abortEarly: false });
exports.featureTagSchema = joi_1.default.object().keys({
    featureName: util_1.nameType,
    tagType: util_1.nameType.optional(),
    tagValue: joi_1.default.string(),
    type: util_1.nameType.optional(),
    value: joi_1.default.string().optional(),
    createdByUserId: joi_1.default.number().optional(),
});
//# sourceMappingURL=feature-schema.js.map