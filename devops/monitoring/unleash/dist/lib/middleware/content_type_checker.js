"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = requireContentType;
const type_is_1 = require("type-is");
const content_type_error_1 = __importDefault(require("../error/content-type-error"));
const DEFAULT_ACCEPTED_CONTENT_TYPE = 'application/json';
/**
 * Builds an express middleware checking the content-type header
 * returning 415 if the header is not either `application/json` or in the array
 * passed into the function of valid content-types
 * @param {String} acceptedContentTypes
 * @returns {function(Request, Response, NextFunction): void}
 */
function requireContentType(...acceptedContentTypes) {
    if (acceptedContentTypes.length === 0) {
        acceptedContentTypes.push(DEFAULT_ACCEPTED_CONTENT_TYPE);
    }
    return (req, res, next) => {
        const contentType = req.header('Content-Type');
        if (contentType !== undefined &&
            (0, type_is_1.is)(contentType, acceptedContentTypes)) {
            next();
        }
        else {
            const error = new content_type_error_1.default(acceptedContentTypes, contentType);
            res.status(error.statusCode).json(error).end();
        }
    };
}
//# sourceMappingURL=content_type_checker.js.map