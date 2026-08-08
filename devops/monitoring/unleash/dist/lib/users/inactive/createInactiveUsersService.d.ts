import { InactiveUsersService } from './inactive-users-service';
import type { IUnleashConfig } from '../../server-impl';
import type { Db } from '../../server-impl';
import type { UserService } from '../../services';
export declare const createInactiveUsersService: (db: Db, config: IUnleashConfig, userService: UserService) => InactiveUsersService;
export declare const createFakeInactiveUsersService: ({ getLogger, userInactivityThresholdInDays, }: Pick<IUnleashConfig, "getLogger" | "userInactivityThresholdInDays">, userService: UserService) => InactiveUsersService;
//# sourceMappingURL=createInactiveUsersService.d.ts.map