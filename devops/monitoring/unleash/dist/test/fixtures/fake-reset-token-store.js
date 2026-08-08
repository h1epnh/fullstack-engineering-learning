"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notfound_error_1 = __importDefault(require("../../lib/error/notfound-error"));
class FakeResetTokenStore {
    constructor() {
        this.data = [];
    }
    async getActive(token) {
        const row = this.data.find((tokens) => tokens.token === token);
        if (!row) {
            throw new notfound_error_1.default();
        }
        return row;
    }
    async insert(newToken) {
        const token = {
            userId: newToken.user_id,
            token: newToken.reset_token,
            expiresAt: newToken.expires_at,
            createdBy: newToken.created_by || 'system-user',
            createdAt: new Date(),
        };
        this.data.push(token);
        return Promise.resolve(token);
    }
    async delete(token) {
        this.data.splice(this.data.findIndex((t) => t.token === token), 1);
        return Promise.resolve();
    }
    async deleteExpired() {
        throw new Error('Not implemented in mock');
    }
    async deleteAll() {
        this.data = [];
    }
    async deleteFromQuery(query) {
        this.data = this.data.filter((t) => t.userId !== query.user_id && t.token !== query.reset_token);
    }
    destroy() { }
    async exists(token) {
        return this.data.some((f) => f.token === token);
    }
    async expireExistingTokensForUser(user_id) {
        this.data
            .filter((f) => f.userId === user_id)
            .forEach((t) => {
            // eslint-disable-next-line no-param-reassign
            t.expiresAt = new Date();
        });
    }
    async get(token) {
        const foundToken = this.data.find((t) => t.token === token);
        if (foundToken === undefined) {
            throw new notfound_error_1.default('Could find token');
        }
        return Promise.resolve(foundToken);
    }
    async getActiveTokens() {
        const now = new Date();
        return this.data.filter((t) => t.expiresAt > now);
    }
    async getAll() {
        return this.data;
    }
    async useToken(token) {
        if (await this.exists(token.token)) {
            const d = this.data.find((t) => t.usedAt === null && t.token === token.token);
            d.usedAt = new Date();
            return true;
        }
        return false;
    }
}
exports.default = FakeResetTokenStore;
//# sourceMappingURL=fake-reset-token-store.js.map