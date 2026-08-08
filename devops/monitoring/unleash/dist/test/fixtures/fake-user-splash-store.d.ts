import type { IUserSplashKey, IUserSplash, IUserSplashStore } from '../../lib/types/stores/user-splash-store';
export default class FakeUserSplashStore implements IUserSplashStore {
    getAllUserSplashes(userId: number): Promise<IUserSplash[]>;
    getSplash(userId: number, splashId: string): Promise<IUserSplash>;
    updateSplash(splash: IUserSplash): Promise<IUserSplash>;
    exists(key: IUserSplashKey): Promise<boolean>;
    get(key: IUserSplashKey): Promise<IUserSplash>;
    getAll(): Promise<IUserSplash[]>;
    delete(key: IUserSplashKey): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
}
//# sourceMappingURL=fake-user-splash-store.d.ts.map