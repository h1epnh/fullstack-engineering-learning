"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addonDefinitionSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const util_1 = require("../routes/util");
const tag_type_schema_1 = require("../services/tag-type-schema");
const installation_definition_schema_1 = require("./installation-definition-schema");
exports.addonDefinitionSchema = joi_1.default.object().keys({
    name: util_1.nameType,
    displayName: joi_1.default.string(),
    documentationUrl: joi_1.default.string().uri({ scheme: [/https?/] }),
    description: joi_1.default.string().allow(''),
    howTo: joi_1.default.string().optional().allow(''),
    deprecated: joi_1.default.string().optional().allow(''),
    parameters: joi_1.default
        .array()
        .optional()
        .items(joi_1.default.object().keys({
        name: joi_1.default.string().required(),
        displayName: joi_1.default.string().required(),
        type: joi_1.default.string().required(),
        description: joi_1.default.string(),
        placeholder: joi_1.default.string().allow(''),
        required: joi_1.default.boolean().default(false),
        sensitive: joi_1.default.boolean().default(false),
    })),
    events: joi_1.default.array().optional().items(joi_1.default.string()),
    tagTypes: joi_1.default.array().optional().items(tag_type_schema_1.tagTypeSchema),
    installation: installation_definition_schema_1.installationDefinitionSchema.optional(),
    alerts: joi_1.default
        .array()
        .optional()
        .items(joi_1.default.object().keys({
        type: joi_1.default.string().valid('success', 'info', 'warning', 'error'),
        text: joi_1.default.string().required(),
    })),
});
//# sourceMappingURL=addon-schema.js.map