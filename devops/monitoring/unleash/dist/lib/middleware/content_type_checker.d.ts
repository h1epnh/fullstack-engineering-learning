import type { RequestHandler } from 'express';
/**
 * Builds an express middleware checking the content-type header
 * returning 415 if the header is not either `application/json` or in the array
 * passed into the function of valid content-types
 * @param {String} acceptedContentTypes
 * @returns {function(Request, Response, NextFunction): void}
 */
export default function requireContentType(...acceptedContentTypes: string[]): RequestHandler;
//# sourceMappingURL=content_type_checker.d.ts.map