import type { IInactiveUserRow, IInactiveUsersStore } from './types/inactive-users-store-type';
import type { Db } from '../../db/db';
import type EventEmitter from 'events';
import type { LogProvider } from '../../logger';
export declare class InactiveUsersStore implements IInactiveUsersStore {
    private db;
    private readonly logger;
    private timer;
    private eventEmitter;
    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider);
    getInactiveUsers(daysInactive: number): Promise<IInactiveUserRow[]>;
}
//# sourceMappingURL=inactive-users-store.d.ts.map