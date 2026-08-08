import type { IUnleashStores } from '../types/stores';
import type { IUnleashConfig } from '../types/option';
import { type IApiUser } from '../types/api-user';
import { type IApiToken, type ILegacyApiTokenCreate, type IApiTokenCreate } from '../types/models/api-token';
import { type IAuditUser } from '../types';
import type EventService from '../features/events/event-service';
export declare class ApiTokenService {
    private store;
    private environmentStore;
    private logger;
    private activeTokens;
    private queryAfter;
    private eventService;
    private lastSeenSecrets;
    private flagResolver;
    private timer;
    private resourceLimits;
    private eventBus;
    constructor({ apiTokenStore, environmentStore, }: Pick<IUnleashStores, 'apiTokenStore' | 'environmentStore'>, config: Pick<IUnleashConfig, 'getLogger' | 'authentication' | 'flagResolver' | 'eventBus' | 'resourceLimits'>, eventService: EventService);
    /**
     * Called by a scheduler without jitter to refresh all active tokens
     */
    fetchActiveTokens(): Promise<void>;
    getToken(secret: string): Promise<IApiToken | undefined>;
    getTokenWithCache(secret: string): Promise<IApiToken | undefined>;
    updateLastSeen(): Promise<void>;
    getAllTokens(): Promise<IApiToken[]>;
    private initApiTokens;
    getUserForToken(secret: string): Promise<IApiUser | undefined>;
    updateExpiry(secret: string, expiresAt: Date, auditUser: IAuditUser): Promise<IApiToken>;
    delete(secret: string, auditUser: IAuditUser): Promise<void>;
    /**
     * @deprecated This may be removed in a future release, prefer createApiTokenWithProjects
     */
    createApiToken(newToken: Omit<ILegacyApiTokenCreate, 'secret'>, auditUser?: IAuditUser): Promise<IApiToken>;
    /**
     * @param newToken
     * @param createdBy should be IApiUser or IUser. Still supports optional or string for backward compatibility
     * @param createdByUserId still supported for backward compatibility
     */
    createApiTokenWithProjects(newToken: Omit<IApiTokenCreate, 'secret'>, auditUser?: IAuditUser): Promise<IApiToken>;
    private internalCreateApiTokenWithProjects;
    private validateApiTokenLimit;
    createMigratedProxyApiToken(newToken: Omit<IApiTokenCreate, 'secret'>): Promise<IApiToken>;
    private normalizeTokenType;
    private insertNewApiToken;
    private findInvalidProject;
    private generateSecretKey;
}
//# sourceMappingURL=api-token-service.d.ts.map