import type { IUnleashStores } from '../types/stores';
import type { IUnleashConfig } from '../types/option';
import type { ISession } from '../types/stores/session-store';
export default class SessionService {
    private logger;
    private sessionStore;
    private resolveMaxSessions;
    constructor({ sessionStore }: Pick<IUnleashStores, 'sessionStore'>, { getLogger }: Pick<IUnleashConfig, 'getLogger'>);
    getActiveSessions(): Promise<ISession[]>;
    getSessionsForUser(userId: number): Promise<ISession[]>;
    getSession(sid: string): Promise<ISession | undefined>;
    deleteSessionsForUser(userId: number): Promise<void>;
    deleteStaleSessionsForUser(userId: number, maxSessions: number): Promise<number>;
    deleteSession(sid: string): Promise<void>;
    insertSession({ sid, sess, }: Pick<ISession, 'sid' | 'sess'>): Promise<ISession>;
    getSessionsCount(): Promise<{
        [k: string]: number;
    }>;
    getMaxSessionsCount(): Promise<number>;
}
//# sourceMappingURL=session-service.d.ts.map