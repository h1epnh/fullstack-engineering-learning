"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateImageUrl = void 0;
const crypto_1 = require("crypto");
const base = 'https://gravatar.com/avatar';
const generateImageUrl = (user) => {
    let ident = user.email || user.username || String(user.id);
    if (ident.indexOf('@')) {
        ident = ident.toLowerCase().trim();
    }
    else {
        ident = ident.trim();
    }
    const identHash = (0, crypto_1.createHash)('sha256').update(ident).digest('hex');
    return `${base}/${identHash}?s=42&d=retro&r=g`;
};
exports.generateImageUrl = generateImageUrl;
//# sourceMappingURL=generateImageUrl.js.map