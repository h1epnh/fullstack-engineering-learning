import type { EventEmitter } from 'events';
import type { LogProvider } from '../logger';
import type { ITag } from '../types/model';
import type { ITagStore } from '../types/stores/tag-store';
import type { Db } from './db';
interface ITagTable {
    type: string;
    value: string;
}
export default class TagStore implements ITagStore {
    private db;
    private logger;
    private readonly timer;
    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider);
    getTagsByType(type: string): Promise<ITag[]>;
    getAll(): Promise<ITag[]>;
    getTag(type: string, value: string): Promise<ITag>;
    exists(tag: ITag): Promise<boolean>;
    createTag(tag: ITag): Promise<void>;
    delete(tag: ITag): Promise<void>;
    deleteAll(): Promise<void>;
    bulkImport(tags: ITag[]): Promise<ITag[]>;
    destroy(): void;
    get({ type, value }: ITag): Promise<ITag>;
    rowToTag(row: ITagTable): ITag;
}
export {};
//# sourceMappingURL=tag-store.d.ts.map