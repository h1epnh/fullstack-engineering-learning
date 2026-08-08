import type { IFavoriteFeature } from '../favorites';
import type { Store } from './store';
export interface IFavoriteFeatureKey {
    userId: number;
    feature: string;
}
export interface IFavoriteFeaturesStore extends Store<IFavoriteFeature, IFavoriteFeatureKey> {
    addFavoriteFeature(favorite: IFavoriteFeatureKey): Promise<IFavoriteFeature | undefined>;
}
//# sourceMappingURL=favorite-features.d.ts.map