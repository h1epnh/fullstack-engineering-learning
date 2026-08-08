"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrichContextWithIp = void 0;
exports.createContext = createContext;
// Copy of https://github.com/Unleash/unleash-proxy/blob/main/src/create-context.ts.
const node_crypto_1 = __importDefault(require("node:crypto"));
function createContext(contextData) {
    const { appName, environment, userId, sessionId, remoteAddress, properties, ...rest } = contextData;
    // move non root context fields to properties
    const context = {
        appName,
        environment,
        userId,
        sessionId,
        remoteAddress,
        properties: Object.assign({}, rest, properties),
    };
    // Clean undefined properties on the context
    const cleanContext = Object.keys(context)
        .filter((k) => context[k])
        .reduce((a, k) => ({ ...a, [k]: context[k] }), {});
    return cleanContext;
}
const enrichContextWithIp = (contextData, ip) => {
    contextData.remoteAddress = contextData.remoteAddress || ip;
    contextData.sessionId =
        contextData.sessionId || node_crypto_1.default.randomBytes(18).toString('hex');
    return createContext(contextData);
};
exports.enrichContextWithIp = enrichContextWithIp;
//# sourceMappingURL=create-context.js.map