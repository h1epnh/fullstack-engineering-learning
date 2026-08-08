"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const semver_1 = require("./semver");
test('parseStrictSemVer', () => {
    expect((0, semver_1.parseStrictSemVer)('')).toEqual(null);
    expect((0, semver_1.parseStrictSemVer)('v')).toEqual(null);
    expect((0, semver_1.parseStrictSemVer)('v1')).toEqual(null);
    expect((0, semver_1.parseStrictSemVer)('v1.2.3')).toEqual(null);
    expect((0, semver_1.parseStrictSemVer)('=1.2.3')).toEqual(null);
    expect((0, semver_1.parseStrictSemVer)('1.2')).toEqual(null);
    expect((0, semver_1.parseStrictSemVer)('1.2.3.4')).toEqual(null);
    expect((0, semver_1.parseStrictSemVer)('1.2.3').version).toEqual('1.2.3');
});
test('mustParseSemVer', () => {
    expect(() => (0, semver_1.mustParseStrictSemVer)('').version).toThrow();
    expect(() => (0, semver_1.mustParseStrictSemVer)('1').version).toThrow();
    expect(() => (0, semver_1.mustParseStrictSemVer)('1.2').version).toThrow();
    expect(() => (0, semver_1.mustParseStrictSemVer)('v1.2').version).toThrow();
    expect(() => (0, semver_1.mustParseStrictSemVer)('v1.2.3').version).toThrow();
    expect(() => (0, semver_1.mustParseStrictSemVer)('=1.2.3').version).toThrow();
    expect(() => (0, semver_1.mustParseStrictSemVer)('1.2.3.4').version).toThrow();
    expect((0, semver_1.mustParseStrictSemVer)('1.2.3').version).toEqual('1.2.3');
});
//# sourceMappingURL=semver.test.js.map