"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const rewriteHTML_1 = require("./rewriteHTML");
const input = fs_1.default
    .readFileSync(path_1.default.join(__dirname, '../../test/examples', 'index.html'))
    .toString();
test('rewriteHTML substitutes meta tag with existing rewrite value', () => {
    const result = (0, rewriteHTML_1.rewriteHTML)(input, '/hosted');
    expect(result.includes('<meta name="baseUriPath" content="/hosted" />')).toBe(true);
});
test('rewriteHTML substitutes meta tag with empty value', () => {
    const result = (0, rewriteHTML_1.rewriteHTML)(input, '');
    expect(result.includes('<meta name="baseUriPath" content="" />')).toBe(true);
});
test('rewriteHTML substitutes asset paths correctly with baseUriPath', () => {
    const result = (0, rewriteHTML_1.rewriteHTML)(input, '/hosted');
    expect(result.includes('<script type="module" crossorigin src="/hosted/static/index')).toBe(true);
});
test('rewriteHTML substitutes asset paths correctly without baseUriPath', () => {
    const result = (0, rewriteHTML_1.rewriteHTML)(input, '');
    expect(result.includes('<script type="module" crossorigin src="/static/index')).toBe(true);
});
test('rewriteHTML substitutes asset paths correctly with cdnPrefix', () => {
    const result = (0, rewriteHTML_1.rewriteHTML)(input, '', 'https://cdn.getunleash.io/v4.1.0');
    expect(result.includes('<script type="module" crossorigin src="https://cdn.getunleash.io/v4.1.0/static/index')).toBe(true);
});
test('rewriteHTML swaps out faviconPath if cdnPrefix is set', () => {
    const result = (0, rewriteHTML_1.rewriteHTML)(input, '', 'https://cdn.getunleash.io/v4.1.0');
    expect(result.includes('<link rel="icon" href="https://cdn.getunleash.io/favicon.ico" />')).toBe(true);
});
test('rewriteHTML sets favicon path to root', () => {
    const result = (0, rewriteHTML_1.rewriteHTML)(input, '');
    expect(result.includes('<link rel="icon" href="/favicon.ico" />')).toBe(true);
});
//# sourceMappingURL=rewriteHTML.test.js.map