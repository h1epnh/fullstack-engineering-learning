"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAllErrorHandler = void 0;
const util_1 = require("../routes/util");
const catchAllErrorHandler = (logProvider) => {
    const logger = logProvider('/debug-error-handler.ts');
    // should not remove next as express needs 4 parameters to distinguish error handler from regular handler
    /* eslint-disable @typescript-eslint/no-unused-vars */
    return (err, req, res, next) => {
        (0, util_1.handleErrors)(res, logger, err);
    };
};
exports.catchAllErrorHandler = catchAllErrorHandler;
//# sourceMappingURL=catch-all-error-handler.js.map