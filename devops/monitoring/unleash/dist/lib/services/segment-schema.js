"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureStrategySegmentSchema = exports.segmentSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const feature_schema_1 = require("../schema/feature-schema");
exports.segmentSchema = joi_1.default
    .object()
    .keys({
    name: joi_1.default.string().required(),
    description: joi_1.default.string().allow(null).allow('').optional(),
    constraints: joi_1.default.array().items(feature_schema_1.constraintSchema).required(),
})
    .options({ allowUnknown: true });
exports.featureStrategySegmentSchema = joi_1.default
    .object()
    .keys({
    segmentId: joi_1.default.number().required(),
    featureStrategyId: joi_1.default.string().required(),
})
    .options({ allowUnknown: true });
//# sourceMappingURL=segment-schema.js.map