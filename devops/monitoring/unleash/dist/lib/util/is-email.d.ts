/**
 * Loosely validate an email address.
 * Max length of an email address is 320 characters: 64 for the local part + 1 for the @ +
 * 255 for the domain part.
 * See https://datatracker.ietf.org/doc/html/rfc5321#section-4.5.3.1.1
 *
 * Being a bit extra cautious here and limiting the max length to 500 characters, which prevents
 * [Regular expression Denial of Service - ReDoS](https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS) attacks
 * due to polynomial regular expression used on uncontrolled data.
 *
 * @param {string} string
 * @return {boolean}
 */
declare function isEmail(value: string): boolean;
export default isEmail;
//# sourceMappingURL=is-email.d.ts.map