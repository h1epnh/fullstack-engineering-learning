import type { EventEmitter } from 'events';
import type { LogProvider } from '../logger';
import type { PublicSignupTokenSchema } from '../openapi/spec/public-signup-token-schema';
import type { IPublicSignupTokenStore } from '../types/stores/public-signup-token-store';
import type { IPublicSignupTokenCreate } from '../types/models/public-signup-token';
import type { Db } from './db';
export declare class PublicSignupTokenStore implements IPublicSignupTokenStore {
    private logger;
    private timer;
    private db;
    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider);
    count(): Promise<number>;
    private makeTokenUsersQuery;
    getAll(): Promise<PublicSignupTokenSchema[]>;
    addTokenUser(secret: string, userId: number): Promise<void>;
    insert(newToken: IPublicSignupTokenCreate): Promise<PublicSignupTokenSchema>;
    isValid(secret: string): Promise<boolean>;
    destroy(): void;
    exists(secret: string): Promise<boolean>;
    get(key: string): Promise<PublicSignupTokenSchema>;
    delete(secret: string): Promise<void>;
    deleteAll(): Promise<void>;
    update(secret: string, { expiresAt, enabled }: {
        expiresAt?: Date;
        enabled?: boolean;
    }): Promise<PublicSignupTokenSchema>;
}
//# sourceMappingURL=public-signup-token-store.d.ts.map