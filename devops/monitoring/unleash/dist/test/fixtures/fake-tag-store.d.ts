import type { ITagStore } from '../../lib/types/stores/tag-store';
import type { ITag } from '../../lib/types/model';
export default class FakeTagStore implements ITagStore {
    tags: ITag[];
    bulkImport(tags: ITag[]): Promise<ITag[]>;
    createTag(tag: ITag): Promise<void>;
    delete(key: ITag): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
    exists(key: ITag): Promise<boolean>;
    get(key: ITag): Promise<ITag>;
    getAll(): Promise<ITag[]>;
    getTag(type: string, value: string): Promise<ITag>;
    getTagsByType(type: string): Promise<ITag[]>;
}
//# sourceMappingURL=fake-tag-store.d.ts.map