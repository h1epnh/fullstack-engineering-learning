"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoritesService = void 0;
const types_1 = require("../types");
const error_1 = require("../error");
class FavoritesService {
    constructor({ favoriteFeaturesStore, favoriteProjectsStore, }, config, eventService) {
        this.config = config;
        this.logger = config.getLogger('services/favorites-service.ts');
        this.favoriteFeaturesStore = favoriteFeaturesStore;
        this.favoriteProjectsStore = favoriteProjectsStore;
        this.eventService = eventService;
    }
    async favoriteFeature({ feature, user }, auditUser) {
        const data = await this.favoriteFeaturesStore.addFavoriteFeature({
            feature: feature,
            userId: user.id,
        });
        if (data === undefined) {
            throw new error_1.NotFoundError(`Feature with name ${feature} did not exist`);
        }
        await this.eventService.storeEvent(new types_1.FeatureFavoritedEvent({
            featureName: feature,
            data: {
                feature,
            },
            auditUser,
        }));
        return data;
    }
    async unfavoriteFeature({ feature, user }, auditUser) {
        const data = await this.favoriteFeaturesStore.delete({
            feature: feature,
            userId: user.id,
        });
        await this.eventService.storeEvent(new types_1.FeatureUnfavoritedEvent({
            featureName: feature,
            data: {
                feature,
            },
            auditUser,
        }));
        return data;
    }
    async favoriteProject({ project, user }, auditUser) {
        const data = await this.favoriteProjectsStore.addFavoriteProject({
            project,
            userId: user.id,
        });
        if (data === undefined) {
            throw new error_1.NotFoundError(`Project with id ${project} was not found`);
        }
        await this.eventService.storeEvent(new types_1.ProjectFavoritedEvent({
            data: {
                project,
            },
            project,
            auditUser,
        }));
        return data;
    }
    async unfavoriteProject({ project, user }, auditUser) {
        const data = await this.favoriteProjectsStore.delete({
            project: project,
            userId: user.id,
        });
        await this.eventService.storeEvent(new types_1.ProjectUnfavoritedEvent({
            data: {
                project,
            },
            project,
            auditUser,
        }));
    }
    async isFavoriteProject(favorite) {
        if (favorite.userId) {
            return this.favoriteProjectsStore.exists(favorite);
        }
        return Promise.resolve(false);
    }
}
exports.FavoritesService = FavoritesService;
//# sourceMappingURL=favorites-service.js.map