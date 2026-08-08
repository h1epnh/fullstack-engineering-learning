import type { IUnleashConfig } from '../types/option';
import type { IUnleashStores } from '../types/stores';
import type { IFavoriteFeature, IFavoriteProject } from '../types/favorites';
import { type IAuditUser } from '../types';
import type { IUser } from '../types/user';
import type { IFavoriteProjectKey } from '../types/stores/favorite-projects';
import type EventService from '../features/events/event-service';
export interface IFavoriteFeatureProps {
    feature: string;
    user: IUser;
}
export interface IFavoriteProjectProps {
    project: string;
    user: IUser;
}
export declare class FavoritesService {
    private config;
    private logger;
    private favoriteFeaturesStore;
    private favoriteProjectsStore;
    private eventService;
    constructor({ favoriteFeaturesStore, favoriteProjectsStore, }: Pick<IUnleashStores, 'favoriteFeaturesStore' | 'favoriteProjectsStore'>, config: IUnleashConfig, eventService: EventService);
    favoriteFeature({ feature, user }: IFavoriteFeatureProps, auditUser: IAuditUser): Promise<IFavoriteFeature>;
    unfavoriteFeature({ feature, user }: IFavoriteFeatureProps, auditUser: IAuditUser): Promise<void>;
    favoriteProject({ project, user }: IFavoriteProjectProps, auditUser: IAuditUser): Promise<IFavoriteProject>;
    unfavoriteProject({ project, user }: IFavoriteProjectProps, auditUser: IAuditUser): Promise<void>;
    isFavoriteProject(favorite: IFavoriteProjectKey): Promise<boolean>;
}
//# sourceMappingURL=favorites-service.d.ts.map