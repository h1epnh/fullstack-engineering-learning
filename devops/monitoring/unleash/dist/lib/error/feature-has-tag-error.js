"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unleash_error_1 = require("./unleash-error");
class FeatureHasTagError extends unleash_error_1.UnleashError {
    constructor() {
        super(...arguments);
        this.statusCode = 409;
    }
}
exports.default = FeatureHasTagError;
module.exports = FeatureHasTagError;
//# sourceMappingURL=feature-has-tag-error.js.map