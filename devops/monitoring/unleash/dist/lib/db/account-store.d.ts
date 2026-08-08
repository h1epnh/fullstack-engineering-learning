import type { LogProvider } from '../logger';
import User from '../types/user';
import type { IUserLookup } from '../types/stores/user-store';
import type { IAdminCount } from '../types/stores/account-store';
import type { IAccountStore, MinimalUser } from '../types';
import type { Db } from './db';
export declare class AccountStore implements IAccountStore {
    private db;
    private logger;
    constructor(db: Db, getLogger: LogProvider);
    buildSelectAccount(q: IUserLookup): any;
    activeAccounts(): any;
    hasAccount(idQuery: IUserLookup): Promise<number | undefined>;
    getAll(): Promise<User[]>;
    search(query: string): Promise<User[]>;
    getAllWithId(userIdList: number[]): Promise<User[]>;
    getByQuery(idQuery: IUserLookup): Promise<User>;
    delete(id: number): Promise<void>;
    deleteAll(): Promise<void>;
    count(): Promise<number>;
    destroy(): void;
    exists(id: number): Promise<boolean>;
    get(id: number): Promise<User>;
    getAccountByPersonalAccessToken(secret: string): Promise<User>;
    markSeenAt(secrets: string[]): Promise<void>;
    getAdminCount(): Promise<IAdminCount>;
    getAdmins(): Promise<MinimalUser[]>;
}
//# sourceMappingURL=account-store.d.ts.map