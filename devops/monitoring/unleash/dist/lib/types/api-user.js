"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = require("joi");
const permissions_1 = require("./permissions");
class ApiUser {
    constructor({ permissions = [permissions_1.CLIENT], projects, project, environment, type, secret, tokenName, }) {
        this.isAPI = true;
        if (!tokenName) {
            throw new joi_1.ValidationError('tokenName is required', [], undefined);
        }
        this.username = tokenName;
        this.permissions = permissions;
        this.environment = environment;
        this.type = type;
        this.secret = secret;
        if (projects && projects.length > 0) {
            this.projects = projects;
        }
        else {
            this.projects = project ? [project] : [];
        }
    }
}
exports.default = ApiUser;
//# sourceMappingURL=api-user.js.map