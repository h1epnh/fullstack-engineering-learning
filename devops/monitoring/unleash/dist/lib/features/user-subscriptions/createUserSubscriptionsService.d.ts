import type { Db, IUnleashConfig } from '../../server-impl';
import { UserSubscriptionsService } from './user-subscriptions-service';
export declare const createUserSubscriptionsService: (config: IUnleashConfig) => (db: Db) => UserSubscriptionsService;
export declare const createFakeUserSubscriptionsService: (config: IUnleashConfig) => UserSubscriptionsService;
//# sourceMappingURL=createUserSubscriptionsService.d.ts.map