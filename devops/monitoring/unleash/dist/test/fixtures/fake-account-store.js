"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeAccountStore = void 0;
class FakeAccountStore {
    constructor() {
        this.idSeq = 1;
        this.data = [];
    }
    async hasAccount({ id, username, email, }) {
        const user = this.data.find((i) => {
            if (id && i.id === id)
                return true;
            if (username && i.username === username)
                return true;
            if (email && i.email === email)
                return true;
            return false;
        });
        if (user) {
            return user.id;
        }
        return undefined;
    }
    destroy() { }
    async exists(key) {
        return this.data.some((u) => u.id === key);
    }
    async count() {
        return this.data.length;
    }
    async get(key) {
        return this.data.find((u) => u.id === key);
    }
    async getByQuery({ id, username, email }) {
        const user = this.data.find((i) => {
            if (i.id && i.id === id)
                return true;
            if (i.username && i.username === username)
                return true;
            if (i.email && i.email === email)
                return true;
            return false;
        });
        if (user) {
            return user;
        }
        throw new Error('Could not find user');
    }
    async getAll() {
        return Promise.resolve(this.data);
    }
    async delete(id) {
        this.data = this.data.filter((item) => item.id !== id);
        return Promise.resolve();
    }
    buildSelectUser() {
        throw new Error('Not implemented');
    }
    async search() {
        throw new Error('Not implemented');
    }
    async getAllWithId() {
        throw new Error('Not implemented');
    }
    deleteAll() {
        return Promise.resolve(undefined);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAccountByPersonalAccessToken(secret) {
        return Promise.resolve(undefined);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async markSeenAt(secrets) {
        throw new Error('Not implemented');
    }
    async getAdminCount() {
        throw new Error('Not implemented');
    }
    async getAdmins() {
        return [];
    }
}
exports.FakeAccountStore = FakeAccountStore;
//# sourceMappingURL=fake-account-store.js.map