"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserStoreMock {
    constructor() {
        this.idSeq = 1;
        this.data = [];
        this.previousPasswords = new Map();
    }
    async getFirstUserDate() {
        if (this.data.length === 0) {
            return null;
        }
        const oldestUser = this.data.reduce((oldest, user) => {
            if (!user.createdAt) {
                return oldest;
            }
            return !oldest.createdAt || user.createdAt < oldest.createdAt
                ? user
                : oldest;
        }, this.data[0]);
        return oldestUser.createdAt || null;
    }
    getPasswordsPreviouslyUsed(userId) {
        return Promise.resolve(this.previousPasswords.get(userId) || []);
    }
    countServiceAccounts() {
        return Promise.resolve(0);
    }
    async hasUser({ id, username, email, }) {
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
    async countRecentlyDeleted() {
        return Promise.resolve(0);
    }
    async get(key) {
        return this.data.find((u) => u.id === key);
    }
    async insert(user) {
        user.id = this.idSeq;
        this.idSeq += 1;
        this.data.push(user);
        return Promise.resolve(user);
    }
    async update(id, user) {
        this.data = this.data.map((o) => {
            if (o.id === id)
                return { ...o, name: user.name };
            return o;
        });
        return Promise.resolve(user);
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
    async setPasswordHash(userId, passwordHash) {
        const u = this.data.find((a) => a.id === userId);
        // @ts-expect-error
        u.passwordHash = passwordHash;
        const previousPasswords = this.previousPasswords.get(userId) || [];
        previousPasswords.push(passwordHash);
        this.previousPasswords.set(userId, previousPasswords.slice(1, 6));
        return Promise.resolve();
    }
    async getPasswordHash(id) {
        const u = this.data.find((i) => i.id === id);
        // @ts-expect-error
        return Promise.resolve(u.passwordHash);
    }
    async delete(id) {
        this.data = this.data.filter((item) => item.id !== id);
        return Promise.resolve();
    }
    async successfullyLogin(user) {
        if (!this.exists(user.id)) {
            throw new Error('No such user');
        }
        return 0;
    }
    buildSelectUser() {
        throw new Error('Not implemented');
    }
    async search() {
        throw new Error('Not implemented');
    }
    async getAllUsers() {
        throw new Error('Not implemented');
    }
    async getAllWithId() {
        throw new Error('Not implemented');
    }
    async incLoginAttempts() {
        throw new Error('Not implemented');
    }
    deleteAll() {
        return Promise.resolve(undefined);
    }
    deleteScimUsers() {
        throw new Error('Method not implemented.');
    }
    upsert(user) {
        this.data.splice(this.data.findIndex((u) => u.email === user.email));
        const userToReturn = {
            id: this.data.length + 1,
            createdAt: new Date(),
            isAPI: false,
            permissions: [],
            loginAttempts: 0,
            imageUrl: '',
            name: user.name ?? '',
            username: user.username ?? '',
            email: user.email ?? '',
            ...user,
        };
        this.data.push(userToReturn);
        return Promise.resolve(userToReturn);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getUserByPersonalAccessToken(secret) {
        throw new Error('Not implemented');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async markSeenAt(secrets) {
        throw new Error('Not implemented');
    }
}
module.exports = UserStoreMock;
exports.default = UserStoreMock;
//# sourceMappingURL=fake-user-store.js.map