"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEnvVarNumber = parseEnvVarNumber;
exports.parseEnvVarBoolean = parseEnvVarBoolean;
exports.parseEnvVarStrings = parseEnvVarStrings;
exports.parseEnvVarJSON = parseEnvVarJSON;
function parseEnvVarNumber(envVar, defaultVal) {
    if (!envVar) {
        return defaultVal;
    }
    const parsed = Number.parseInt(envVar, 10);
    if (Number.isNaN(parsed)) {
        return defaultVal;
    }
    return parsed;
}
function parseEnvVarBoolean(envVar, defaultVal) {
    if (envVar) {
        return envVar === 'true' || envVar === '1' || envVar === 't';
    }
    return defaultVal;
}
function parseEnvVarStrings(envVar, defaultVal) {
    if (typeof envVar === 'string') {
        return envVar
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }
    return defaultVal;
}
function parseEnvVarJSON(envVar, defaultVal) {
    if (envVar) {
        try {
            return JSON.parse(envVar);
        }
        catch (e) {
            return defaultVal;
        }
    }
    return defaultVal;
}
//# sourceMappingURL=parseEnvVar.js.map