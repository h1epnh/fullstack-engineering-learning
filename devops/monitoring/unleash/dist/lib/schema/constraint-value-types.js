"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.constraintDateTypeSchema = exports.constraintStringTypeSchema = exports.constraintNumberTypeSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.constraintNumberTypeSchema = joi_1.default.number();
exports.constraintStringTypeSchema = joi_1.default
    .array()
    .items(joi_1.default.string())
    .min(1);
exports.constraintDateTypeSchema = joi_1.default.date();
//# sourceMappingURL=constraint-value-types.js.map