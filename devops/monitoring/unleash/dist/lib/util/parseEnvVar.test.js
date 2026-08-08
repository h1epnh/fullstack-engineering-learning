"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parseEnvVar_1 = require("./parseEnvVar");
test('parseEnvVarNumber', () => {
    expect((0, parseEnvVar_1.parseEnvVarNumber)('', 1)).toEqual(1);
    expect((0, parseEnvVar_1.parseEnvVarNumber)('', 2)).toEqual(2);
    expect((0, parseEnvVar_1.parseEnvVarNumber)(' ', 1)).toEqual(1);
    expect((0, parseEnvVar_1.parseEnvVarNumber)('a', 1)).toEqual(1);
    expect((0, parseEnvVar_1.parseEnvVarNumber)('1', 1)).toEqual(1);
    expect((0, parseEnvVar_1.parseEnvVarNumber)('2', 1)).toEqual(2);
    expect((0, parseEnvVar_1.parseEnvVarNumber)('2e2', 1)).toEqual(2);
    expect((0, parseEnvVar_1.parseEnvVarNumber)('-1', 1)).toEqual(-1);
});
test('parseEnvVarBoolean', () => {
    expect((0, parseEnvVar_1.parseEnvVarBoolean)('', true)).toEqual(true);
    expect((0, parseEnvVar_1.parseEnvVarBoolean)('', false)).toEqual(false);
    expect((0, parseEnvVar_1.parseEnvVarBoolean)(' ', false)).toEqual(false);
    expect((0, parseEnvVar_1.parseEnvVarBoolean)('1', false)).toEqual(true);
    expect((0, parseEnvVar_1.parseEnvVarBoolean)('2', false)).toEqual(false);
    expect((0, parseEnvVar_1.parseEnvVarBoolean)('t', false)).toEqual(true);
    expect((0, parseEnvVar_1.parseEnvVarBoolean)('f', false)).toEqual(false);
    expect((0, parseEnvVar_1.parseEnvVarBoolean)('true', false)).toEqual(true);
    expect((0, parseEnvVar_1.parseEnvVarBoolean)('false', false)).toEqual(false);
    expect((0, parseEnvVar_1.parseEnvVarBoolean)('test', false)).toEqual(false);
});
test('parseEnvVarStringList', () => {
    expect((0, parseEnvVar_1.parseEnvVarStrings)(undefined, [])).toEqual([]);
    expect((0, parseEnvVar_1.parseEnvVarStrings)(undefined, ['a'])).toEqual(['a']);
    expect((0, parseEnvVar_1.parseEnvVarStrings)('', ['a'])).toEqual([]);
    expect((0, parseEnvVar_1.parseEnvVarStrings)('', [])).toEqual([]);
    expect((0, parseEnvVar_1.parseEnvVarStrings)('  ', [])).toEqual([]);
    expect((0, parseEnvVar_1.parseEnvVarStrings)('a', ['*'])).toEqual(['a']);
    expect((0, parseEnvVar_1.parseEnvVarStrings)('a,b,c', [])).toEqual(['a', 'b', 'c']);
    expect((0, parseEnvVar_1.parseEnvVarStrings)('a,b,c', [])).toEqual(['a', 'b', 'c']);
    expect((0, parseEnvVar_1.parseEnvVarStrings)(' a,,,b,  c , ,', [])).toEqual(['a', 'b', 'c']);
});
//# sourceMappingURL=parseEnvVar.test.js.map