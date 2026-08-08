import type { Db } from '../../db/db';
import type { IUniqueConnectionStore } from '../../types';
import type { UniqueConnections } from './unique-connection-store-type';
export declare class UniqueConnectionStore implements IUniqueConnectionStore {
    private db;
    constructor(db: Db);
    insert(uniqueConnections: UniqueConnections): Promise<void>;
    get(id: 'current' | 'previous'): Promise<(UniqueConnections & {
        updatedAt: Date;
    }) | null>;
    deleteAll(): Promise<void>;
}
//# sourceMappingURL=unique-connection-store.d.ts.map