import type { IUser } from '../types/user';
import type { IUnleashConfig } from '../types/option';
import type { IUnleashStores } from '../types/stores';
import type { AccessService } from './access-service';
import type { IAdminCount } from '../types/stores/account-store';
interface IUserWithRole extends IUser {
    rootRole: number;
}
export declare class AccountService {
    private logger;
    private store;
    private accessService;
    private lastSeenSecrets;
    constructor(stores: Pick<IUnleashStores, 'accountStore'>, { getLogger }: Pick<IUnleashConfig, 'getLogger'>, services: {
        accessService: AccessService;
    });
    getAll(): Promise<IUserWithRole[]>;
    getAccountByPersonalAccessToken(secret: string): Promise<IUser>;
    getAdminCount(): Promise<IAdminCount>;
    updateLastSeen(): Promise<void>;
    addPATSeen(secret: string): void;
}
export {};
//# sourceMappingURL=account-service.d.ts.map