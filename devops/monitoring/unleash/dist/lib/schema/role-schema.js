"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleSchema = exports.permissionRoleSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.permissionRoleSchema = joi_1.default
    .object()
    .keys({
    id: joi_1.default.number(),
    name: joi_1.default.string(),
    environment: joi_1.default.string().optional().allow('').allow(null).default(''),
})
    .or('id', 'name')
    .options({ stripUnknown: true, allowUnknown: false, abortEarly: false });
exports.roleSchema = joi_1.default
    .object()
    .keys({
    name: joi_1.default.string().trim().required(),
    description: joi_1.default.string().optional().allow('').allow(null).default(''),
    permissions: joi_1.default
        .array()
        .allow(null)
        .optional()
        .items(exports.permissionRoleSchema),
})
    .options({ stripUnknown: true, allowUnknown: false, abortEarly: false });
//# sourceMappingURL=role-schema.js.map