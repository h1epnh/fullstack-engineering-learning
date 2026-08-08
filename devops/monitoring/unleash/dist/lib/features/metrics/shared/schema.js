"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientRegisterSchema = exports.batchMetricsSchema = exports.applicationSchema = exports.clientMetricsEnvBulkSchema = exports.clientMetricsEnvSchema = exports.clientMetricsSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const countSchema = joi_1.default
    .object()
    .options({ stripUnknown: true })
    .keys({
    yes: joi_1.default.number().min(0).empty('').default(0),
    no: joi_1.default.number().min(0).empty('').default(0),
    variants: joi_1.default.object().pattern(joi_1.default.string(), joi_1.default.number().min(0)),
});
exports.clientMetricsSchema = joi_1.default
    .object()
    .options({ stripUnknown: true })
    .keys({
    environment: joi_1.default.string().optional(),
    appName: joi_1.default.string().required(),
    instanceId: joi_1.default.string().empty(['', null]).default('default'),
    bucket: joi_1.default
        .object()
        .required()
        .keys({
        start: joi_1.default.date().required(),
        stop: joi_1.default.date().required(),
        toggles: joi_1.default.object().pattern(/.*/, countSchema),
    }),
});
exports.clientMetricsEnvSchema = joi_1.default
    .object()
    .options({ stripUnknown: true })
    .keys({
    featureName: joi_1.default.string().required(),
    environment: joi_1.default.string().required(),
    appName: joi_1.default.string().required(),
    yes: joi_1.default.number().default(0),
    no: joi_1.default.number().default(0),
    timestamp: joi_1.default.date(),
    variants: joi_1.default.object().pattern(joi_1.default.string(), joi_1.default.number().min(0)),
});
exports.clientMetricsEnvBulkSchema = joi_1.default
    .array()
    .items(exports.clientMetricsEnvSchema)
    .empty();
exports.applicationSchema = joi_1.default
    .object()
    .options({ stripUnknown: false })
    .keys({
    appName: joi_1.default.string().required(),
    sdkVersion: joi_1.default.string().optional(),
    strategies: joi_1.default
        .array()
        .optional()
        .items(joi_1.default.string(), joi_1.default.any().strip()),
    description: joi_1.default.string().allow('').optional(),
    url: joi_1.default.string().allow('').optional(),
    color: joi_1.default.string().allow('').optional(),
    icon: joi_1.default.string().allow('').optional(),
    announced: joi_1.default.boolean().optional().default(false),
});
exports.batchMetricsSchema = joi_1.default
    .object()
    .options({ stripUnknown: true })
    .keys({
    applications: joi_1.default.array().items(exports.applicationSchema),
    metrics: joi_1.default.array().items(exports.clientMetricsEnvSchema),
});
exports.clientRegisterSchema = joi_1.default
    .object()
    .options({ stripUnknown: true })
    .keys({
    appName: joi_1.default.string().required(),
    instanceId: joi_1.default.string().empty(['', null]).default('default'),
    sdkVersion: joi_1.default.string().optional(),
    strategies: joi_1.default
        .array()
        .required()
        .items(joi_1.default.string(), joi_1.default.any().strip()),
    started: joi_1.default.date().required(),
    interval: joi_1.default.number().required(),
    environment: joi_1.default.string().optional(),
    project: joi_1.default.string().optional(),
    projects: joi_1.default.array().optional().items(joi_1.default.string()),
});
//# sourceMappingURL=schema.js.map