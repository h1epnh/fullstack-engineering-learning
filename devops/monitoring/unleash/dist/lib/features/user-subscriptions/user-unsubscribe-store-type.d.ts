export type UnsubscribeEntry = {
    userId: number;
    subscription: string;
    createdAt?: Date;
};
export interface IUserUnsubscribeStore {
    insert(item: UnsubscribeEntry): Promise<void>;
    delete(item: UnsubscribeEntry): Promise<void>;
}
//# sourceMappingURL=user-unsubscribe-store-type.d.ts.map