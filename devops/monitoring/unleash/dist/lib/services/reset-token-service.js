"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const url_1 = require("url");
const used_token_error_1 = __importDefault(require("../error/used-token-error"));
const invalid_token_error_1 = __importDefault(require("../error/invalid-token-error"));
const date_fns_1 = require("date-fns");
class ResetTokenService {
    constructor({ resetTokenStore }, { getLogger, server }) {
        this.expireExistingTokensForUser = async (userId) => {
            return this.store.expireExistingTokensForUser(userId);
        };
        this.store = resetTokenStore;
        this.logger = getLogger('/services/reset-token-service.ts');
        this.unleashBase = server.unleashUrl;
    }
    async useAccessToken(token) {
        try {
            await this.isValid(token.token);
            await this.store.useToken(token);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    async getActiveInvitations() {
        try {
            const tokens = await this.store.getActiveTokens();
            const links = tokens.reduce((acc, token) => {
                const inviteLink = this.getExistingInvitationUrl(token).toString();
                acc[token.userId] = inviteLink;
                return acc;
            }, {});
            return links;
        }
        catch (e) {
            return {};
        }
    }
    async isValid(token) {
        let t;
        try {
            t = await this.store.getActive(token);
            if (!t.usedAt) {
                return t;
            }
        }
        catch (e) {
            throw new invalid_token_error_1.default();
        }
        throw new used_token_error_1.default(t.usedAt);
    }
    getExistingInvitationUrl(token) {
        return new url_1.URL(`${this.unleashBase}/new-user?token=${token.token}`);
    }
    async createResetUrl(forUser, creator, path) {
        const token = await this.createToken(forUser, creator);
        return Promise.resolve(new url_1.URL(`${this.unleashBase}${path}?token=${token.token}`));
    }
    async createResetPasswordUrl(forUser, creator) {
        const path = '/reset-password';
        return this.createResetUrl(forUser, creator, path);
    }
    async createNewUserUrl(forUser, creator) {
        const path = '/new-user';
        return this.createResetUrl(forUser, creator, path);
    }
    async createToken(tokenUser, creator, expiryDelta = (0, date_fns_1.hoursToMilliseconds)(24)) {
        const token = await this.generateToken();
        const expiry = new Date(Date.now() + expiryDelta);
        await this.expireExistingTokensForUser(tokenUser);
        return this.store.insert({
            reset_token: token,
            user_id: tokenUser,
            expires_at: expiry,
            created_by: creator,
        });
    }
    generateToken() {
        return bcryptjs_1.default.hash(crypto_1.default.randomBytes(32).toString(), 10);
    }
}
exports.default = ResetTokenService;
module.exports = ResetTokenService;
//# sourceMappingURL=reset-token-service.js.map