"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validateOrigin_1 = require("./validateOrigin");
test('validateOrigin', () => {
    expect((0, validateOrigin_1.validateOrigin)(undefined)).toEqual(false);
    expect((0, validateOrigin_1.validateOrigin)('')).toEqual(false);
    expect((0, validateOrigin_1.validateOrigin)(' ')).toEqual(false);
    expect((0, validateOrigin_1.validateOrigin)('a')).toEqual(false);
    expect((0, validateOrigin_1.validateOrigin)('**')).toEqual(false);
    expect((0, validateOrigin_1.validateOrigin)('localhost')).toEqual(false);
    expect((0, validateOrigin_1.validateOrigin)('localhost:8080')).toEqual(false);
    expect((0, validateOrigin_1.validateOrigin)('//localhost:8080')).toEqual(false);
    expect((0, validateOrigin_1.validateOrigin)('http://localhost/')).toEqual(false);
    expect((0, validateOrigin_1.validateOrigin)('http://localhost/a')).toEqual(false);
    expect((0, validateOrigin_1.validateOrigin)('https://example.com/a')).toEqual(false);
    expect((0, validateOrigin_1.validateOrigin)('https://example.com ')).toEqual(false);
    expect((0, validateOrigin_1.validateOrigin)('https://*.example.com ')).toEqual(false);
    expect((0, validateOrigin_1.validateOrigin)('*.example.com')).toEqual(false);
    expect((0, validateOrigin_1.validateOrigin)('*')).toEqual(true);
    expect((0, validateOrigin_1.validateOrigin)('http://localhost')).toEqual(true);
    expect((0, validateOrigin_1.validateOrigin)('http://localhost:8080')).toEqual(true);
    expect((0, validateOrigin_1.validateOrigin)('https://example.com')).toEqual(true);
    expect((0, validateOrigin_1.validateOrigin)('https://example.com:8080')).toEqual(true);
});
//# sourceMappingURL=validateOrigin.test.js.map