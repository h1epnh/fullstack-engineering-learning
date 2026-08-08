import type { IAddon, IAddonDto, IAddonStore } from '../../lib/types/stores/addon-store';
export default class FakeAddonStore implements IAddonStore {
    addons: IAddon[];
    highestId: number;
    delete(key: number): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
    exists(key: number): Promise<boolean>;
    get(key: number): Promise<IAddon>;
    getAll(): Promise<IAddon[]>;
    insert(addon: IAddonDto): Promise<IAddon>;
    update(id: number, addon: IAddonDto): Promise<IAddon>;
}
//# sourceMappingURL=fake-addon-store.d.ts.map