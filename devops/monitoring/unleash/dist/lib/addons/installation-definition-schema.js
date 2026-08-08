"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.installationDefinitionSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.installationDefinitionSchema = joi_1.default.object().keys({
    url: joi_1.default.string().uri({ scheme: [/https?/] }),
    title: joi_1.default.string().optional(),
    helpText: joi_1.default.string().optional(),
});
//# sourceMappingURL=installation-definition-schema.js.map