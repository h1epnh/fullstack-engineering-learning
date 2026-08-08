"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const util_1 = require("../routes/util");
const util_2 = require("../util");
exports.tagSchema = joi_1.default.object()
    .keys({
    value: joi_1.default.string().min(util_2.TAG_MIN_LENGTH).max(util_2.TAG_MAX_LENGTH),
    type: util_1.customJoi
        .isUrlFriendly()
        .min(util_2.TAG_MIN_LENGTH)
        .max(util_2.TAG_MAX_LENGTH)
        .default('simple'),
})
    .options({
    allowUnknown: false,
    stripUnknown: true,
    abortEarly: false,
});
module.exports = { tagSchema: exports.tagSchema };
//# sourceMappingURL=tag-schema.js.map