import type EventEmitter from 'events';
import type { LogProvider } from '../../../logger';
import type { Db } from '../../../server-impl';
import type { LastSeenInput } from './last-seen-service';
import type { ILastSeenStore } from './types/last-seen-store-type';
export default class LastSeenStore implements ILastSeenStore {
    private db;
    private logger;
    private timer;
    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider);
    setLastSeen(data: LastSeenInput[]): Promise<void>;
    cleanLastSeen(): Promise<void>;
}
//# sourceMappingURL=last-seen-store.d.ts.map