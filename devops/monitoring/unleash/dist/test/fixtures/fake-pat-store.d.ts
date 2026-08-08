import type { IPatStore } from '../../lib/types/stores/pat-store';
import type { CreatePatSchema, PatSchema } from '../../lib/openapi';
export default class FakePatStore implements IPatStore {
    create(pat: CreatePatSchema, secret: string, userId: number): Promise<PatSchema>;
    delete(key: number): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
    exists(key: number): Promise<boolean>;
    existsWithDescriptionByUser(description: string, userId: number): Promise<boolean>;
    countByUser(userId: number): Promise<number>;
    get(key: number): Promise<PatSchema>;
    getAll(query?: Object): Promise<PatSchema[]>;
    getAllByUser(userId: number): Promise<PatSchema[]>;
    deleteForUser(id: number, userId: number): Promise<void>;
}
//# sourceMappingURL=fake-pat-store.d.ts.map