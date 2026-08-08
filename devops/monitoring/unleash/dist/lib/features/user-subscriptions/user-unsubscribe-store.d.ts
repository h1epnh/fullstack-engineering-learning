import type { Db } from '../../db/db';
import type { IUserUnsubscribeStore } from './user-unsubscribe-store-type';
export declare const TABLE = "user_unsubscription";
export declare class UserUnsubscribeStore implements IUserUnsubscribeStore {
    private db;
    constructor(db: Db);
    insert({ userId, subscription }: {
        userId: any;
        subscription: any;
    }): Promise<void>;
    delete({ userId, subscription }: {
        userId: any;
        subscription: any;
    }): Promise<void>;
    destroy(): void;
}
//# sourceMappingURL=user-unsubscribe-store.d.ts.map