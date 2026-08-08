"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unleash_error_1 = require("../error/unleash-error");
class AuthenticationRequired extends unleash_error_1.UnleashError {
    constructor({ type, path, message, options, defaultHidden = false, }) {
        super(message);
        this.statusCode = 401;
        this.type = type;
        this.path = path;
        this.options = options;
        this.defaultHidden = defaultHidden;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            path: this.path,
            type: this.type,
            defaultHidden: this.defaultHidden,
            ...(this.options ? { options: this.options } : {}),
        };
    }
}
exports.default = AuthenticationRequired;
module.exports = AuthenticationRequired;
//# sourceMappingURL=authentication-required.js.map