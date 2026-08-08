import type { IResetQuery, IResetToken, IResetTokenCreate, IResetTokenQuery, IResetTokenStore } from '../../lib/types/stores/reset-token-store';
export default class FakeResetTokenStore implements IResetTokenStore {
    data: IResetToken[];
    constructor();
    getActive(token: string): Promise<IResetToken>;
    insert(newToken: IResetTokenCreate): Promise<IResetToken>;
    delete(token: string): Promise<void>;
    deleteExpired(): Promise<void>;
    deleteAll(): Promise<void>;
    deleteFromQuery(query: IResetTokenQuery): Promise<void>;
    destroy(): void;
    exists(token: string): Promise<boolean>;
    expireExistingTokensForUser(user_id: number): Promise<void>;
    get(token: string): Promise<IResetToken>;
    getActiveTokens(): Promise<IResetToken[]>;
    getAll(): Promise<IResetToken[]>;
    useToken(token: IResetQuery): Promise<boolean>;
}
//# sourceMappingURL=fake-reset-token-store.d.ts.map