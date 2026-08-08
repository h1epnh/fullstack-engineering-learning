import type { ISettingStore } from '../../lib/types/stores/settings-store';
export default class FakeSettingStore implements ISettingStore {
    settings: Map<string, any>;
    delete(key: string): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
    exists(key: string): Promise<boolean>;
    get(key: string): Promise<any>;
    getAll(): Promise<any[]>;
    insert(name: string, content: any): Promise<void>;
    updateRow(name: string, content: any): Promise<void>;
    postgresVersion(): Promise<string>;
}
//# sourceMappingURL=fake-setting-store.d.ts.map