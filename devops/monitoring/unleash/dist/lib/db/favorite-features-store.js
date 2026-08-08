"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoriteFeaturesStore = void 0;
const T = {
    FAVORITE_FEATURES: 'favorite_features',
};
const rowToFavorite = (row) => {
    return {
        userId: row.user_id,
        feature: row.feature,
        createdAt: row.created_at,
    };
};
class FavoriteFeaturesStore {
    constructor(db, eventBus, getLogger) {
        this.db = db;
        this.eventBus = eventBus;
        this.logger = getLogger('lib/db/favorites-store.ts');
    }
    async addFavoriteFeature({ userId, feature, }) {
        const insertedFeature = await this.db(T.FAVORITE_FEATURES)
            .insert({ feature, user_id: userId })
            .onConflict(['user_id', 'feature'])
            .merge()
            .returning('*');
        return rowToFavorite(insertedFeature[0]);
    }
    async delete({ userId, feature }) {
        return this.db(T.FAVORITE_FEATURES)
            .where({ feature, user_id: userId })
            .del();
    }
    async deleteAll() {
        await this.db(T.FAVORITE_FEATURES).del();
    }
    destroy() { }
    async exists({ userId, feature }) {
        const result = await this.db.raw(`SELECT EXISTS (SELECT 1 FROM ${T.FAVORITE_FEATURES} WHERE user_id = ? AND feature = ?) AS present`, [userId, feature]);
        const { present } = result.rows[0];
        return present;
    }
    async get({ userId, feature, }) {
        const favorite = await this.db
            .table(T.FAVORITE_FEATURES)
            .select()
            .where({ feature, user_id: userId })
            .first();
        return rowToFavorite(favorite);
    }
    async getAll() {
        const groups = await this.db(T.FAVORITE_FEATURES).select();
        return groups.map(rowToFavorite);
    }
}
exports.FavoriteFeaturesStore = FavoriteFeaturesStore;
//# sourceMappingURL=favorite-features-store.js.map