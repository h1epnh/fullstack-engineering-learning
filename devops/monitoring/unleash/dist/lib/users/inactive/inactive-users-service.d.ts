import { type IAuditUser, type IUnleashConfig, type IUnleashStores } from '../../types';
import type { InactiveUserSchema } from '../../openapi';
import type { UserService } from '../../services';
export declare class InactiveUsersService {
    private inactiveUsersStore;
    private readonly logger;
    private userService;
    private readonly userInactivityThresholdInDays;
    constructor({ inactiveUsersStore }: Pick<IUnleashStores, 'inactiveUsersStore'>, { getLogger, userInactivityThresholdInDays, }: Pick<IUnleashConfig, 'getLogger' | 'userInactivityThresholdInDays'>, services: {
        userService: UserService;
    });
    getInactiveUsers(): Promise<InactiveUserSchema[]>;
    deleteInactiveUsers(calledByUser: IAuditUser, userIds: number[]): Promise<void>;
}
//# sourceMappingURL=inactive-users-service.d.ts.map