"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const format_base_uri_1 = require("./format-base-uri");
test('formatBaseUri returns the correct path when the path is the right format', () => {
    const result = (0, format_base_uri_1.formatBaseUri)('/hosted');
    expect(result === '/hosted').toBe(true);
});
test('formatBaseUri returns the correct path when the path lacking initial slash', () => {
    const result = (0, format_base_uri_1.formatBaseUri)('hosted');
    expect(result === '/hosted').toBe(true);
});
test('formatBaseUri returns the correct path when the path has both initial and trailing slash', () => {
    const result = (0, format_base_uri_1.formatBaseUri)('/hosted/');
    expect(result === '/hosted').toBe(true);
});
test('formatBaseUri returns the correct path when the path has only trailing slash', () => {
    const result = (0, format_base_uri_1.formatBaseUri)('hosted/');
    expect(result === '/hosted').toBe(true);
});
test('formatBaseUri returns empty string when called without input', () => {
    const result = (0, format_base_uri_1.formatBaseUri)(undefined);
    expect(result === '').toBe(true);
});
test('formatBaseUri handles levels of paths', () => {
    const result = (0, format_base_uri_1.formatBaseUri)('hosted/multi/path');
    expect(result === '/hosted/multi/path').toBe(true);
});
//# sourceMappingURL=format-base-uri.test.js.map