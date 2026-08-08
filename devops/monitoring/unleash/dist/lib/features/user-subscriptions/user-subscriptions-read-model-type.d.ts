export type Subscriber = {
    name: string;
    email: string;
};
export interface IUserSubscriptionsReadModel {
    getSubscribedUsers(subscription: string): Promise<Subscriber[]>;
    getUnsubscribedUsers(subscription: string): Promise<Subscriber[]>;
    getUserSubscriptions(userId: number): Promise<string[]>;
}
export declare const SUBSCRIPTION_TYPES: readonly ["productivity-report"];
//# sourceMappingURL=user-subscriptions-read-model-type.d.ts.map