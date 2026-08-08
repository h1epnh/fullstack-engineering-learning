import type { IFavoriteProjectsStore } from '../../lib/types';
import type { IFavoriteProjectKey } from '../../lib/types/stores/favorite-projects';
import type { IFavoriteProject } from '../../lib/types/favorites';
export default class FakeFavoriteProjectsStore implements IFavoriteProjectsStore {
    addFavoriteProject(favorite: IFavoriteProjectKey): Promise<IFavoriteProject | undefined>;
    delete(key: IFavoriteProjectKey): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
    exists(key: IFavoriteProjectKey): Promise<boolean>;
    get(key: IFavoriteProjectKey): Promise<IFavoriteProject | undefined>;
    getAll(query?: Object): Promise<IFavoriteProject[]>;
}
//# sourceMappingURL=fake-favorite-projects-store.d.ts.map