"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagTypeSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const util_1 = require("../routes/util");
exports.tagTypeSchema = joi_1.default.object()
    .keys({
    name: util_1.customJoi.isUrlFriendly().min(2).max(50).required(),
    description: joi_1.default.string().allow(''),
    icon: joi_1.default.string().allow(null).allow(''),
    color: joi_1.default.string()
        .pattern(/^#[0-9A-Fa-f]{6}$/)
        .allow(null)
        .allow(''),
})
    .options({
    allowUnknown: false,
    stripUnknown: true,
    abortEarly: false,
});
module.exports = { tagTypeSchema: exports.tagTypeSchema };
//# sourceMappingURL=tag-type-schema.js.map