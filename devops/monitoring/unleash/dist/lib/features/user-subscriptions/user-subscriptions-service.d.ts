import { type IUnleashConfig, type IUnleashStores } from '../../types';
import type { IAuditUser } from '../../types/user';
import type EventService from '../events/event-service';
export declare class UserSubscriptionsService {
    private userUnsubscribeStore;
    private userSubscriptionsReadModel;
    private eventService;
    private logger;
    constructor({ userUnsubscribeStore, userSubscriptionsReadModel, }: Pick<IUnleashStores, 'userUnsubscribeStore' | 'userSubscriptionsReadModel'>, { getLogger }: Pick<IUnleashConfig, 'getLogger'>, eventService: EventService);
    getUserSubscriptions(userId: number): Promise<string[]>;
    subscribe(userId: number, subscription: string, auditUser: IAuditUser): Promise<void>;
    unsubscribe(userId: number, subscription: string, auditUser: IAuditUser): Promise<void>;
}
//# sourceMappingURL=user-subscriptions-service.d.ts.map