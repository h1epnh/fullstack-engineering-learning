import type { IFavoriteFeaturesStore } from '../../lib/types';
import type { IFavoriteFeatureKey } from '../../lib/types/stores/favorite-features';
import type { IFavoriteFeature } from '../../lib/types/favorites';
export default class FakeFavoriteFeaturesStore implements IFavoriteFeaturesStore {
    addFavoriteFeature(favorite: IFavoriteFeatureKey): Promise<IFavoriteFeature | undefined>;
    delete(key: IFavoriteFeatureKey): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
    exists(key: IFavoriteFeatureKey): Promise<boolean>;
    get(key: IFavoriteFeatureKey): Promise<IFavoriteFeature | undefined>;
    getAll(query?: Object): Promise<IFavoriteFeature[]>;
}
//# sourceMappingURL=fake-favorite-features-store.d.ts.map