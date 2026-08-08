"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ensureStringValue_1 = require("./ensureStringValue");
test('ensureStringValue', () => {
    expect((0, ensureStringValue_1.ensureStringValue)(null)).toEqual('');
    expect((0, ensureStringValue_1.ensureStringValue)(undefined)).toEqual('');
    expect((0, ensureStringValue_1.ensureStringValue)('null')).toEqual('null');
    expect((0, ensureStringValue_1.ensureStringValue)('undefined')).toEqual('undefined');
    expect((0, ensureStringValue_1.ensureStringValue)('')).toEqual('');
    expect((0, ensureStringValue_1.ensureStringValue)('a')).toEqual('a');
    expect((0, ensureStringValue_1.ensureStringValue)(0)).toEqual('0');
    expect((0, ensureStringValue_1.ensureStringValue)(true)).toEqual('true');
    expect((0, ensureStringValue_1.ensureStringValue)({})).toEqual('{}');
    expect((0, ensureStringValue_1.ensureStringValue)({ b: 1 })).toEqual('{"b":1}');
});
//# sourceMappingURL=ensureStringValue.test.js.map