import type EventEmitter from 'events';
import type { LogProvider } from '../logger';
import type { IAddon, IAddonDto, IAddonStore } from '../types/stores/addon-store';
import type { Db } from './db';
export default class AddonStore implements IAddonStore {
    private db;
    private logger;
    private readonly timer;
    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider);
    destroy(): void;
    getAll(query?: {}): Promise<IAddon[]>;
    get(id: number): Promise<IAddon>;
    insert(addon: IAddonDto): Promise<IAddon>;
    update(id: number, addon: IAddonDto): Promise<IAddon>;
    delete(id: number): Promise<void>;
    deleteAll(): Promise<void>;
    exists(id: number): Promise<boolean>;
    rowToAddon(row: any): IAddon;
    addonToRow(addon: IAddonDto): {
        provider: string;
        enabled: boolean;
        description: string | null | undefined;
        parameters: string;
        events: string;
        projects: string;
        environments: string;
    };
}
//# sourceMappingURL=addon-store.d.ts.map