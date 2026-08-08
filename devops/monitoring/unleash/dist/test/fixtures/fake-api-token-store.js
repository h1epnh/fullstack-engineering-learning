"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
class FakeApiTokenStore extends events_1.default {
    constructor() {
        super(...arguments);
        this.tokens = [];
    }
    countByType() {
        return Promise.resolve(new Map());
    }
    async delete(key) {
        this.tokens.splice(this.tokens.findIndex((t) => t.secret === key), 1);
    }
    async count() {
        return this.tokens.length;
    }
    async deleteAll() {
        this.tokens = [];
    }
    destroy() { }
    async exists(key) {
        return this.tokens.some((token) => token.secret === key);
    }
    async get(key) {
        const found = this.tokens.find((t) => t.secret === key);
        // clone the object to get a copy
        return found ? { ...found } : undefined;
    }
    async getAll() {
        return this.tokens;
    }
    async getAllActive() {
        return this.tokens.filter((token) => !token.expiresAt || token.expiresAt > new Date());
    }
    async insert(newToken) {
        const apiToken = {
            createdAt: new Date(),
            project: newToken.projects?.join(',') || '*',
            alias: null,
            ...newToken,
        };
        this.tokens.push(apiToken);
        this.emit('insert');
        return apiToken;
    }
    async markSeenAt(secrets) {
        this.tokens
            .filter((t) => secrets.includes(t.secret))
            .forEach((t) => {
            // eslint-disable-next-line no-param-reassign
            t.seenAt = new Date();
        });
    }
    async setExpiry(secret, expiresAt) {
        const found = this.tokens.find((t) => t.secret === secret);
        if (!found) {
            return undefined;
        }
        found.expiresAt = expiresAt;
        return found;
    }
    async countDeprecatedTokens() {
        return {
            orphanedTokens: 0,
            activeOrphanedTokens: 0,
            legacyTokens: 0,
            activeLegacyTokens: 0,
        };
    }
    async countProjectTokens() {
        return 0;
    }
}
exports.default = FakeApiTokenStore;
//# sourceMappingURL=fake-api-token-store.js.map