import type { LogProvider } from '../logger';
import type { IPatStore } from '../types/stores/pat-store';
import type { Db } from './db';
import type { CreatePatSchema, PatSchema } from '../openapi';
export default class PatStore implements IPatStore {
    private db;
    private logger;
    constructor(db: Db, getLogger: LogProvider);
    create(pat: CreatePatSchema, secret: string, userId: number): Promise<PatSchema>;
    delete(id: number): Promise<void>;
    deleteForUser(id: number, userId: number): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
    exists(id: number): Promise<boolean>;
    existsWithDescriptionByUser(description: string, userId: number): Promise<boolean>;
    countByUser(userId: number): Promise<number>;
    get(id: number): Promise<PatSchema>;
    getAll(): Promise<PatSchema[]>;
    getAllByUser(userId: number): Promise<PatSchema[]>;
}
//# sourceMappingURL=pat-store.d.ts.map