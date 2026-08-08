import type { IInactiveUserRow, IInactiveUsersStore } from '../types/inactive-users-store-type';
import type { IUser } from '../../../types';
export declare class FakeInactiveUsersStore implements IInactiveUsersStore {
    private users;
    constructor(users?: IUser[]);
    getInactiveUsers(daysInactive: number): Promise<IInactiveUserRow[]>;
}
//# sourceMappingURL=fake-inactive-users-store.d.ts.map