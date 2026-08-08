import type { IUnleashStores } from '../types/stores';
import type { IUnleashConfig } from '../types/option';
import type { IUser } from '../types/user';
import type { IUserSplash } from '../types/stores/user-splash-store';
export default class UserSplashService {
    private userSplashStore;
    private logger;
    constructor({ userSplashStore }: Pick<IUnleashStores, 'userSplashStore'>, { getLogger }: Pick<IUnleashConfig, 'getLogger'>);
    getAllUserSplashes(user: IUser): Promise<Record<string, boolean>>;
    getSplash(user_id: number, splash_id: string): Promise<IUserSplash>;
    updateSplash(splash: IUserSplash): Promise<IUserSplash>;
}
//# sourceMappingURL=user-splash-service.d.ts.map