"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../routes/util");
const joi_1 = __importDefault(require("joi"));
const strategySchema = joi_1.default
    .object()
    .keys({
    name: util_1.nameType,
    title: joi_1.default.string().allow(null).allow('').optional(),
    disabled: joi_1.default.boolean().allow(null).optional(),
    editable: joi_1.default.boolean().default(true),
    deprecated: joi_1.default.boolean().default(false),
    description: joi_1.default.string().allow(null).allow('').optional(),
    parameters: joi_1.default
        .array()
        .required()
        .items(joi_1.default.object().keys({
        name: joi_1.default.string().required(),
        type: joi_1.default.string().required(),
        description: joi_1.default.string().allow(null).allow('').optional(),
        required: joi_1.default.boolean(),
    })),
})
    .options({ allowUnknown: false, stripUnknown: true, abortEarly: false });
exports.default = strategySchema;
module.exports = strategySchema;
//# sourceMappingURL=strategy-schema.js.map