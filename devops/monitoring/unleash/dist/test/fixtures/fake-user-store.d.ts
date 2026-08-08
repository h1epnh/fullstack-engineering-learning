import type User from '../../lib/types/user';
import type { IUser } from '../../lib/types/user';
import type { ICreateUser, IUserLookup, IUserStore } from '../../lib/types/stores/user-store';
declare class UserStoreMock implements IUserStore {
    data: IUser[];
    previousPasswords: Map<number, string[]>;
    idSeq: number;
    constructor();
    getFirstUserDate(): Promise<Date | null>;
    getPasswordsPreviouslyUsed(userId: number): Promise<string[]>;
    countServiceAccounts(): Promise<number>;
    hasUser({ id, username, email, }: IUserLookup): Promise<number | undefined>;
    destroy(): void;
    exists(key: number): Promise<boolean>;
    count(): Promise<number>;
    countRecentlyDeleted(): Promise<number>;
    get(key: number): Promise<IUser>;
    insert(user: User): Promise<User>;
    update(id: number, user: User): Promise<User>;
    getByQuery({ id, username, email }: IUserLookup): Promise<IUser>;
    getAll(): Promise<IUser[]>;
    setPasswordHash(userId: number, passwordHash: string): Promise<void>;
    getPasswordHash(id: number): Promise<string>;
    delete(id: number): Promise<void>;
    successfullyLogin(user: User): Promise<number>;
    buildSelectUser(): any;
    search(): Promise<IUser[]>;
    getAllUsers(): Promise<IUser[]>;
    getAllWithId(): Promise<IUser[]>;
    incLoginAttempts(): Promise<void>;
    deleteAll(): Promise<void>;
    deleteScimUsers(): Promise<void>;
    upsert(user: ICreateUser): Promise<IUser>;
    getUserByPersonalAccessToken(secret: string): Promise<IUser>;
    markSeenAt(secrets: string[]): Promise<void>;
}
export default UserStoreMock;
//# sourceMappingURL=fake-user-store.d.ts.map