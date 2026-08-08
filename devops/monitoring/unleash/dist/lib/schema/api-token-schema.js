"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiToken = void 0;
const joi_1 = __importDefault(require("joi"));
const api_token_1 = require("../types/models/api-token");
const constants_1 = require("../util/constants");
exports.createApiToken = joi_1.default
    .object()
    .keys({
    username: joi_1.default.string().optional(),
    tokenName: joi_1.default.string().optional(),
    type: joi_1.default
        .string()
        .lowercase()
        .required()
        .valid(api_token_1.ApiTokenType.ADMIN, api_token_1.ApiTokenType.CLIENT, api_token_1.ApiTokenType.FRONTEND),
    expiresAt: joi_1.default.date().optional(),
    project: joi_1.default.when('projects', {
        not: joi_1.default.required(),
        then: joi_1.default.string().optional().default(api_token_1.ALL),
    }),
    projects: joi_1.default.array().min(0).optional(),
    environment: joi_1.default.when('type', {
        is: joi_1.default.string().valid(api_token_1.ApiTokenType.CLIENT, api_token_1.ApiTokenType.FRONTEND),
        then: joi_1.default.string().optional().default(constants_1.DEFAULT_ENV),
        otherwise: joi_1.default.string().optional().default(api_token_1.ALL),
    }),
})
    .nand('username', 'tokenName')
    .nand('project', 'projects')
    .options({ stripUnknown: true, allowUnknown: false, abortEarly: false });
//# sourceMappingURL=api-token-schema.js.map