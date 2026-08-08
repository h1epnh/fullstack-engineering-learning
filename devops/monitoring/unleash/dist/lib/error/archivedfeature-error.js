"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unleash_error_1 = require("./unleash-error");
class ArchivedFeatureError extends unleash_error_1.UnleashError {
    constructor(message = 'Cannot perform this operation on archived features') {
        super(message);
        this.statusCode = 400;
    }
}
exports.default = ArchivedFeatureError;
module.exports = ArchivedFeatureError;
//# sourceMappingURL=archivedfeature-error.js.map