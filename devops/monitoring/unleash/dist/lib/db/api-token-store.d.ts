import type { EventEmitter } from 'events';
import type { LogProvider } from '../logger';
import type { IApiTokenStore } from '../types/stores/api-token-store';
import { type IApiToken, type IApiTokenCreate } from '../types/models/api-token';
import type { Db } from './db';
import type { IFlagResolver } from '../types';
export declare class ApiTokenStore implements IApiTokenStore {
    private logger;
    private timer;
    private db;
    private readonly flagResolver;
    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider, flagResolver: IFlagResolver);
    withTimer<T>(timerName: string, fn: () => Promise<T>): Promise<T>;
    count(): Promise<number>;
    countByType(): Promise<Map<string, number>>;
    getAll(): Promise<IApiToken[]>;
    getAllActive(): Promise<IApiToken[]>;
    private makeTokenProjectQuery;
    insert(newToken: IApiTokenCreate): Promise<IApiToken>;
    destroy(): void;
    exists(secret: string): Promise<boolean>;
    get(key: string): Promise<IApiToken>;
    delete(secret: string): Promise<void>;
    deleteAll(): Promise<void>;
    setExpiry(secret: string, expiresAt: Date): Promise<IApiToken>;
    markSeenAt(secrets: string[]): Promise<void>;
    countDeprecatedTokens(): Promise<{
        orphanedTokens: number;
        activeOrphanedTokens: number;
        legacyTokens: number;
        activeLegacyTokens: number;
    }>;
    countProjectTokens(projectId: string): Promise<number>;
}
//# sourceMappingURL=api-token-store.d.ts.map