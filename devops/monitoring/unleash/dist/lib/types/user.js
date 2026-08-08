"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountTypes = void 0;
const joi_1 = require("joi");
const generateImageUrl_1 = require("../util/generateImageUrl");
exports.AccountTypes = ['User', 'Service Account'];
class User {
    constructor({ id, name, email, username, imageUrl, seenAt, loginAttempts, createdAt, isService, scimId, }) {
        this.isAPI = false;
        this.accountType = 'User';
        if (!id) {
            throw new joi_1.ValidationError('Id is required', [], undefined);
        }
        this.id = id;
        this.name = name;
        this.username = username;
        this.email = email;
        this.imageUrl = imageUrl || this.generateImageUrl();
        this.seenAt = seenAt;
        this.loginAttempts = loginAttempts;
        this.createdAt = createdAt;
        this.accountType = isService ? 'Service Account' : 'User';
        this.scimId = scimId;
    }
    generateImageUrl() {
        return (0, generateImageUrl_1.generateImageUrl)(this);
    }
}
exports.default = User;
module.exports = User;
//# sourceMappingURL=user.js.map