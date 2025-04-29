"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityMiddleware = void 0;
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("../config/env");
exports.securityMiddleware = [
    (0, helmet_1.default)(),
    (0, compression_1.default)(),
    (0, morgan_1.default)(env_1.config.NODE_ENV === 'development' ? 'dev' : 'combined'),
];
