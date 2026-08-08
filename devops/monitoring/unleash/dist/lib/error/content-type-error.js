"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unleash_error_1 = require("./unleash-error");
class ContentTypeError extends unleash_error_1.UnleashError {
    constructor(acceptedContentTypes, providedContentType) {
        const message = `We do not accept the content-type you provided (${providedContentType || "you didn't provide one"}). Try using one of the content-types we do accept instead (${acceptedContentTypes.join(', ')}) and make sure the body is in the corresponding format.`;
        super(message);
        this.statusCode = 415;
    }
}
exports.default = ContentTypeError;
module.exports = ContentTypeError;
//# sourceMappingURL=content-type-error.js.map