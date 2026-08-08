import type { LastSeenInput } from './last-seen-service';
import type { ILastSeenStore } from './types/last-seen-store-type';
export declare class FakeLastSeenStore implements ILastSeenStore {
    setLastSeen(data: LastSeenInput[]): Promise<void>;
    cleanLastSeen(): Promise<void>;
}
//# sourceMappingURL=fake-last-seen-store.d.ts.map