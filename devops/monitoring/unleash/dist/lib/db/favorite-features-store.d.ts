import type EventEmitter from 'events';
import type { IFavoriteFeaturesStore } from '../types';
import type { LogProvider } from '../logger';
import type { IFavoriteFeatureKey } from '../types/stores/favorite-features';
import type { IFavoriteFeature } from '../types/favorites';
import type { Db } from './db';
export declare class FavoriteFeaturesStore implements IFavoriteFeaturesStore {
    private logger;
    private eventBus;
    private db;
    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider);
    addFavoriteFeature({ userId, feature, }: IFavoriteFeatureKey): Promise<IFavoriteFeature>;
    delete({ userId, feature }: IFavoriteFeatureKey): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
    exists({ userId, feature }: IFavoriteFeatureKey): Promise<boolean>;
    get({ userId, feature, }: IFavoriteFeatureKey): Promise<IFavoriteFeature>;
    getAll(): Promise<IFavoriteFeature[]>;
}
//# sourceMappingURL=favorite-features-store.d.ts.map