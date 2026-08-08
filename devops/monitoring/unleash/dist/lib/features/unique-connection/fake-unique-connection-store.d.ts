import type { IUniqueConnectionStore } from '../../types';
import type { BucketId, UniqueConnections } from './unique-connection-store-type';
export declare class FakeUniqueConnectionStore implements IUniqueConnectionStore {
    private uniqueConnectionsRecord;
    insert(uniqueConnections: UniqueConnections): Promise<void>;
    get(id: BucketId): Promise<(UniqueConnections & {
        updatedAt: Date;
    }) | null>;
    deleteAll(): Promise<void>;
}
//# sourceMappingURL=fake-unique-connection-store.d.ts.map