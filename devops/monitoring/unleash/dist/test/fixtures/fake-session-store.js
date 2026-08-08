"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FakeSessionStore {
    constructor() {
        this.sessions = [];
    }
    async getActiveSessions() {
        return this.sessions.filter((session) => session.expired != null);
    }
    destroy() { }
    async exists(key) {
        return this.sessions.some((s) => s.sid === key);
    }
    async getAll() {
        return this.sessions;
    }
    async getSessionsForUser(userId) {
        return this.sessions.filter((session) => session.sess.user.id === userId);
    }
    async deleteSessionsForUser(userId) {
        this.sessions = this.sessions.filter((session) => session.sess.user.id !== userId);
    }
    async deleteAll() {
        this.sessions = [];
    }
    async delete(sid) {
        this.sessions.splice(this.sessions.findIndex((s) => s.sid === sid), 1);
    }
    async get(sid) {
        return Promise.resolve(this.sessions.find((s) => s.sid === sid));
    }
    async insertSession(data) {
        const session = { ...data, createdAt: new Date() };
        this.sessions.push(session);
        return session;
    }
    async getSessionsCount() {
        return [];
    }
    async getMaxSessionsCount() {
        return 0;
    }
}
exports.default = FakeSessionStore;
//# sourceMappingURL=fake-session-store.js.map