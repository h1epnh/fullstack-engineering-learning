"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeRegExp = safeRegExp;
function safeRegExp(pattern, flags) {
    return new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
}
//# sourceMappingURL=escape-regex.js.map