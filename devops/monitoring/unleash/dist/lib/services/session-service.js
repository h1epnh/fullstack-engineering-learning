"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const date_fns_1 = require("date-fns");
const memoizee_1 = __importDefault(require("memoizee"));
class SessionService {
    constructor({ sessionStore }, { getLogger }) {
        this.logger = getLogger('lib/services/session-service.ts');
        this.sessionStore = sessionStore;
        this.resolveMaxSessions = (0, memoizee_1.default)(async () => await this.sessionStore.getMaxSessionsCount(), {
            promise: true,
            maxAge: (0, date_fns_1.minutesToMilliseconds)(1),
        });
    }
    async getActiveSessions() {
        return this.sessionStore.getActiveSessions();
    }
    async getSessionsForUser(userId) {
        return this.sessionStore.getSessionsForUser(userId);
    }
    async getSession(sid) {
        return this.sessionStore.get(sid);
    }
    async deleteSessionsForUser(userId) {
        return this.sessionStore.deleteSessionsForUser(userId);
    }
    async deleteStaleSessionsForUser(userId, maxSessions) {
        const userSessions = await this.sessionStore.getSessionsForUser(userId);
        const newestFirst = userSessions.sort((a, b) => (0, date_fns_1.compareDesc)(a.createdAt, b.createdAt));
        const sessionsToDelete = newestFirst.slice(maxSessions);
        await Promise.all(sessionsToDelete.map((session) => this.sessionStore.delete(session.sid)));
        return sessionsToDelete.length;
    }
    async deleteSession(sid) {
        return this.sessionStore.delete(sid);
    }
    async insertSession({ sid, sess, }) {
        return this.sessionStore.insertSession({ sid, sess });
    }
    async getSessionsCount() {
        return Object.fromEntries((await this.sessionStore.getSessionsCount()).map(({ userId, count }) => [userId, count]));
    }
    async getMaxSessionsCount() {
        return this.resolveMaxSessions();
    }
}
exports.default = SessionService;
module.exports = SessionService;
//# sourceMappingURL=session-service.js.map