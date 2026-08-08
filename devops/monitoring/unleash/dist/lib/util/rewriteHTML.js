"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewriteHTML = void 0;
const rewriteHTML = (input, rewriteValue, cdnPrefix, uiFlags) => {
    let result = input;
    result = result.replace(/::baseUriPath::/gi, rewriteValue);
    result = result.replace(/::cdnPrefix::/gi, cdnPrefix || '');
    const faviconPrefix = cdnPrefix ? 'https://cdn.getunleash.io' : '';
    result = result.replace(/::faviconPrefix::/gi, faviconPrefix);
    result = result.replace(/::uiFlags::/gi, uiFlags || '{}');
    result = result.replace(/\/static/gi, `${cdnPrefix || rewriteValue}/static`);
    return result;
};
exports.rewriteHTML = rewriteHTML;
//# sourceMappingURL=rewriteHTML.js.map