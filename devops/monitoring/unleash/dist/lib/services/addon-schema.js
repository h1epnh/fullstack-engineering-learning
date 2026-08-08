"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addonSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const util_1 = require("../routes/util");
exports.addonSchema = joi_1.default
    .object()
    .keys({
    provider: util_1.nameType,
    enabled: joi_1.default.bool().default(true),
    description: joi_1.default.string().allow(null).allow('').optional(),
    parameters: joi_1.default
        .object()
        .pattern(joi_1.default.string(), [joi_1.default.string(), joi_1.default.number(), joi_1.default.boolean()])
        .optional(),
    events: joi_1.default.array().optional().items(joi_1.default.string()),
    projects: joi_1.default.array().optional().items(joi_1.default.string()),
    environments: joi_1.default.array().optional().items(joi_1.default.string()),
})
    .options({ allowUnknown: false, stripUnknown: true });
//# sourceMappingURL=addon-schema.js.map