"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spec_1 = require("./spec");
const validate_1 = require("./validate");
test('validateSchema', () => {
    expect(() => (0, validate_1.validateSchema)('unknownSchemaId', {})).toThrow('no schema with key or ref "unknownSchemaId"');
});
test('throwOnInvalidSchema', () => {
    expect(() => (0, validate_1.throwOnInvalidSchema)(spec_1.constraintSchema.$id, {
        contextName: 'a',
        operator: 'NUM_LTE',
        value: '1',
    })).not.toThrow();
});
test('throwOnInvalidSchema', () => {
    expect(() => (0, validate_1.throwOnInvalidSchema)(spec_1.constraintSchema.$id, {
        contextName: 'a',
        operator: 'invalid-operator',
        value: '1',
    })).toThrow('Request validation failed: your request body or params contain invalid data. Refer to the `details` list for more information.');
});
//# sourceMappingURL=validate.test.js.map