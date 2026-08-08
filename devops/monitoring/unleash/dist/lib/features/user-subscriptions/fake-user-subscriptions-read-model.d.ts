import type { IUserSubscriptionsReadModel } from './user-subscriptions-read-model-type';
export declare class FakeUserSubscriptionsReadModel implements IUserSubscriptionsReadModel {
    getSubscribedUsers(subscription: string): Promise<never[]>;
    getUnsubscribedUsers(subscription: string): Promise<never[]>;
    getUserSubscriptions(): Promise<string[]>;
}
//# sourceMappingURL=fake-user-subscriptions-read-model.d.ts.map