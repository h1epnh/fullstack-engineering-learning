"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.anonymise = anonymise;
exports.anonymiseKeys = anonymiseKeys;
const crypto_1 = require("crypto");
function encrypt(s) {
    const key = process.env.UNLEASH_ENCRYPTION_KEY;
    const iv = process.env.UNLEASH_ENCRYPTION_IV;
    if (!s || !key || !iv) {
        return s ?? '';
    }
    const algorithm = 'aes-256-cbc';
    const cipher = (0, crypto_1.createCipheriv)(algorithm, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    const encrypted = cipher.update(s, 'utf8', 'hex') + cipher.final('hex');
    return `${encrypted}@unleash.run`;
}
function anonymise(s) {
    if (!s) {
        return '';
    }
    const hash = (0, crypto_1.createHash)('sha256')
        .update(s, 'utf-8')
        .digest('hex')
        .slice(0, 9);
    return `${hash}@unleash.run`;
}
function anonymiseKeys(object, keys) {
    if (typeof object !== 'object' || object === null) {
        return object;
    }
    if (Array.isArray(object)) {
        return object.map((item) => anonymiseKeys(item, keys));
    }
    else {
        return Object.keys(object).reduce((result, key) => {
            if (keys.includes(key) &&
                result[key] !== undefined &&
                result[key] !== null) {
                result[key] = anonymise(result[key]);
            }
            else if (typeof result[key] === 'object') {
                result[key] = anonymiseKeys(result[key], keys);
            }
            return result;
        }, object);
    }
}
//# sourceMappingURL=anonymise.js.map