"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mustParseStrictSemVer = exports.parseStrictSemVer = void 0;
const semver_1 = __importDefault(require("semver"));
const parseStrictSemVer = (version) => {
    if (semver_1.default.clean(version) !== version) {
        return null;
    }
    try {
        return semver_1.default.parse(version, { loose: false });
    }
    catch {
        return null;
    }
};
exports.parseStrictSemVer = parseStrictSemVer;
const mustParseStrictSemVer = (version) => {
    const parsedVersion = (0, exports.parseStrictSemVer)(version);
    if (!parsedVersion) {
        throw new Error('Could not parse SemVer string: ${version}');
    }
    return parsedVersion;
};
exports.mustParseStrictSemVer = mustParseStrictSemVer;
//# sourceMappingURL=semver.js.map