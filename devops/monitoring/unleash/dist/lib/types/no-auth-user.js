"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = require("./permissions");
class NoAuthUser {
    constructor(username = 'unknown', id = -1, permissions = [permissions_1.ADMIN]) {
        this.isAPI = true;
        this.username = username;
        this.name = 'unknown';
        this.id = id;
        this.permissions = permissions;
    }
}
exports.default = NoAuthUser;
//# sourceMappingURL=no-auth-user.js.map