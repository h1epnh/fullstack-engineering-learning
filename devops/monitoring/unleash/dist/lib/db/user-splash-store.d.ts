import type { EventEmitter } from 'events';
import type { LogProvider } from '../logger';
import type { IUserSplash, IUserSplashKey, IUserSplashStore } from '../types/stores/user-splash-store';
import type { Db } from './db';
export default class UserSplashStore implements IUserSplashStore {
    private db;
    private logger;
    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider);
    getAllUserSplashes(userId: number): Promise<IUserSplash[]>;
    getSplash(userId: number, splashId: string): Promise<IUserSplash>;
    updateSplash(splash: IUserSplash): Promise<IUserSplash>;
    delete({ userId, splashId }: IUserSplashKey): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
    exists({ userId, splashId }: IUserSplashKey): Promise<boolean>;
    get({ userId, splashId }: IUserSplashKey): Promise<IUserSplash>;
    getAll(): Promise<IUserSplash[]>;
}
//# sourceMappingURL=user-splash-store.d.ts.map