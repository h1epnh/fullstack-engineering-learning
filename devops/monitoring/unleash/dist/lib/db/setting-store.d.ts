import type { LogProvider } from '../logger';
import type { ISettingStore } from '../types/stores/settings-store';
import type { Db } from './db';
export default class SettingStore implements ISettingStore {
    private db;
    private logger;
    constructor(db: Db, getLogger: LogProvider);
    postgresVersion(): Promise<string>;
    updateRow(name: string, content: any): Promise<void>;
    exists(name: string): Promise<boolean>;
    get<T>(name: string): Promise<T | undefined>;
    insert(name: string, content: any): Promise<void>;
    delete(name: string): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
    getAll(): Promise<any[]>;
}
//# sourceMappingURL=setting-store.d.ts.map