import type { ISession, ISessionStore } from '../../lib/types/stores/session-store';
export default class FakeSessionStore implements ISessionStore {
    private sessions;
    getActiveSessions(): Promise<ISession[]>;
    destroy(): void;
    exists(key: string): Promise<boolean>;
    getAll(): Promise<ISession[]>;
    getSessionsForUser(userId: number): Promise<ISession[]>;
    deleteSessionsForUser(userId: number): Promise<void>;
    deleteAll(): Promise<void>;
    delete(sid: string): Promise<void>;
    get(sid: string): Promise<ISession | undefined>;
    insertSession(data: Omit<ISession, 'createdAt'>): Promise<ISession>;
    getSessionsCount(): Promise<{
        userId: number;
        count: number;
    }[]>;
    getMaxSessionsCount(): Promise<number>;
}
//# sourceMappingURL=fake-session-store.d.ts.map