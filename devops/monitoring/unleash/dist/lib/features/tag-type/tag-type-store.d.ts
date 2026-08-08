import type { EventEmitter } from 'events';
import type { LogProvider } from '../../logger';
import type { ITagType, ITagTypeStore } from './tag-type-store-type';
import type { Db } from '../../db/db';
interface ITagTypeTable {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
}
export default class TagTypeStore implements ITagTypeStore {
    private db;
    private logger;
    private readonly timer;
    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider);
    getAll(): Promise<ITagType[]>;
    get(name: string): Promise<ITagType>;
    exists(name: string): Promise<boolean>;
    createTagType(newTagType: ITagType): Promise<void>;
    delete(name: string): Promise<void>;
    deleteAll(): Promise<void>;
    bulkImport(tagTypes: ITagType[]): Promise<ITagType[]>;
    updateTagType({ name, description, icon, color, }: ITagType): Promise<void>;
    destroy(): void;
    rowToTagType(row: ITagTypeTable): ITagType;
}
export {};
//# sourceMappingURL=tag-type-store.d.ts.map