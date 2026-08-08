"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validateJsonString_1 = require("./validateJsonString");
test('should return true for valid json string', () => {
    const input = '{"test":1,"nested":[{"test1":{"testinner":true}}]}';
    expect((0, validateJsonString_1.validateJsonString)(input)).toBe(true);
});
test('should return false for invalid json string (missing starting {)', () => {
    const input = '"test":1,"nested":[{"test1":{"testinner":true}}]}';
    expect((0, validateJsonString_1.validateJsonString)(input)).toBe(false);
});
test('should return false for invalid json string (plain string)', () => {
    const input = 'not a json';
    expect((0, validateJsonString_1.validateJsonString)(input)).toBe(false);
});
test('should return false for invalid json string (null as a string)', () => {
    const input = 'null';
    expect((0, validateJsonString_1.validateJsonString)(input)).toBe(false);
});
//# sourceMappingURL=validateJsonString.test.js.map