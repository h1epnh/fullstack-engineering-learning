"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("../../lib/error");
class FakePublicSignupStore {
    constructor() {
        this.tokens = [];
    }
    async addTokenUser(secret, userId) {
        this.get(secret).then((token) => {
            if (token !== undefined) {
                token.users?.push({ id: userId });
            }
        });
        return Promise.resolve();
    }
    async get(secret) {
        const token = this.tokens.find((t) => t.secret === secret);
        if (!token) {
            throw new error_1.NotFoundError('Could not find token');
        }
        return Promise.resolve(token);
    }
    async isValid(secret) {
        const token = this.tokens.find((t) => t.secret === secret);
        return Promise.resolve(token !== undefined &&
            new Date(token.expiresAt) > new Date() &&
            token.enabled);
    }
    async count() {
        return Promise.resolve(0);
    }
    // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
    async delete(secret) {
        return Promise.resolve(undefined);
    }
    async getAllActive() {
        return Promise.resolve(this.tokens);
    }
    async create(newToken) {
        return this.insert(newToken);
    }
    async insert(newToken) {
        const token = {
            secret: 'some-secret',
            expiresAt: newToken.expiresAt.toISOString(),
            createdAt: new Date().toISOString(),
            users: [],
            url: 'some=url',
            name: newToken.name,
            role: {
                name: 'Viewer',
                type: '',
                id: 1,
            },
            enabled: true,
            createdBy: newToken.createdBy,
        };
        this.tokens.push(token);
        return Promise.resolve(token);
    }
    async update(secret, { expiresAt, enabled }) {
        const token = await this.get(secret);
        if (expiresAt) {
            token.expiresAt = expiresAt.toISOString();
        }
        if (enabled !== undefined) {
            token.enabled = enabled;
        }
        const index = this.tokens.findIndex((t) => t.secret === secret);
        this.tokens[index] = token;
        return Promise.resolve(token);
    }
    async deleteAll() {
        return Promise.resolve(undefined);
    }
    destroy() { }
    async exists(key) {
        return this.tokens.some((t) => t.secret === key);
    }
    // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
    async getAll(query) {
        return Promise.resolve(this.tokens);
    }
}
exports.default = FakePublicSignupStore;
//# sourceMappingURL=fake-public-signup-store.js.map