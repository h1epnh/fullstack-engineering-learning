import type { Db } from '../../db/db';
import { type IUserSubscriptionsReadModel, type Subscriber } from './user-subscriptions-read-model-type';
export declare class UserSubscriptionsReadModel implements IUserSubscriptionsReadModel {
    private db;
    constructor(db: Db);
    getSubscribedUsers(subscription: string): Promise<Subscriber[]>;
    getUnsubscribedUsers(subscription: string): Promise<Subscriber[]>;
    getUserSubscriptions(userId: number): Promise<"productivity-report"[]>;
}
//# sourceMappingURL=user-subscriptions-read-model.d.ts.map