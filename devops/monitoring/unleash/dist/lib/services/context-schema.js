"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextSchema = exports.legalValueSchema = exports.nameSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const util_1 = require("../routes/util");
exports.nameSchema = joi_1.default.object().keys({ name: util_1.nameType });
exports.legalValueSchema = joi_1.default.object().keys({
    value: joi_1.default.string().min(1).max(100).required(),
    description: joi_1.default.string().allow('').allow(null).optional(),
});
exports.contextSchema = joi_1.default
    .object()
    .keys({
    name: util_1.nameType,
    description: joi_1.default.string().max(250).allow('').allow(null).optional(),
    legalValues: joi_1.default
        .array()
        .allow(null)
        .unique((a, b) => a.value === b.value)
        .optional()
        .items(exports.legalValueSchema),
    stickiness: joi_1.default.boolean().optional().default(false),
})
    .options({ allowUnknown: false, stripUnknown: true });
//# sourceMappingURL=context-schema.js.map