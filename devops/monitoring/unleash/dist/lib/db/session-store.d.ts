import type EventEmitter from 'events';
import type { LogProvider } from '../logger';
import type { ISession, ISessionStore } from '../types/stores/session-store';
import type { Db } from './db';
export default class SessionStore implements ISessionStore {
    private logger;
    private eventBus;
    private db;
    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider);
    getActiveSessions(): Promise<ISession[]>;
    getSessionsForUser(userId: number): Promise<ISession[]>;
    get(sid: string): Promise<ISession>;
    deleteSessionsForUser(userId: number): Promise<void>;
    delete(sid: string): Promise<void>;
    insertSession(data: Omit<ISession, 'createdAt'>): Promise<ISession>;
    deleteAll(): Promise<void>;
    destroy(): void;
    exists(sid: string): Promise<boolean>;
    getAll(): Promise<ISession[]>;
    private rowToSession;
    getSessionsCount(): Promise<{
        userId: number;
        count: number;
    }[]>;
    getMaxSessionsCount(): Promise<number>;
}
//# sourceMappingURL=session-store.d.ts.map