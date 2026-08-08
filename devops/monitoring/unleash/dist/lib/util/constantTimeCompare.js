"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.constantTimeCompare = void 0;
const crypto_1 = __importDefault(require("crypto"));
const constantTimeCompare = (a, b) => {
    if (!a || !b || a.length !== b.length) {
        return false;
    }
    return crypto_1.default.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
};
exports.constantTimeCompare = constantTimeCompare;
//# sourceMappingURL=constantTimeCompare.js.map