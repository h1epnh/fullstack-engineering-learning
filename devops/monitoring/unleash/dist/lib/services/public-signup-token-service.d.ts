import { type IAuditUser, type IUnleashConfig, type IUnleashStores } from '../types';
import type { PublicSignupTokenSchema } from '../openapi/spec/public-signup-token-schema';
import type { PublicSignupTokenCreateSchema } from '../openapi/spec/public-signup-token-create-schema';
import type { CreateInvitedUserSchema } from '../openapi/spec/create-invited-user-schema';
import type UserService from './user-service';
import type { IUser } from '../types/user';
import type EventService from '../features/events/event-service';
export declare class PublicSignupTokenService {
    private store;
    private roleStore;
    private userService;
    private eventService;
    private logger;
    private readonly unleashBase;
    constructor({ publicSignupTokenStore, roleStore, }: Pick<IUnleashStores, 'publicSignupTokenStore' | 'roleStore'>, config: Pick<IUnleashConfig, 'getLogger' | 'authentication' | 'server'>, userService: UserService, eventService: EventService);
    private getUrl;
    get(secret: string): Promise<PublicSignupTokenSchema>;
    getAllTokens(): Promise<PublicSignupTokenSchema[]>;
    validate(secret: string): Promise<boolean>;
    update(secret: string, { expiresAt, enabled }: {
        expiresAt?: Date;
        enabled?: boolean;
    }, auditUser: IAuditUser): Promise<PublicSignupTokenSchema>;
    addTokenUser(secret: string, createUser: CreateInvitedUserSchema, auditUser: IAuditUser): Promise<IUser>;
    createNewPublicSignupToken(tokenCreate: PublicSignupTokenCreateSchema, auditUser: IAuditUser): Promise<PublicSignupTokenSchema>;
    private generateSecretKey;
    private getMinimumDate;
}
//# sourceMappingURL=public-signup-token-service.d.ts.map