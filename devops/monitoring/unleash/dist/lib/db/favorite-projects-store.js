"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoriteProjectsStore = void 0;
const T = {
    FAVORITE_PROJECTS: 'favorite_projects',
};
const rowToFavorite = (row) => {
    return {
        userId: row.user_id,
        project: row.project,
        createdAt: row.created_at,
    };
};
class FavoriteProjectsStore {
    constructor(db, eventBus, getLogger) {
        this.db = db;
        this.eventBus = eventBus;
        this.logger = getLogger('lib/db/favorites-store.ts');
    }
    async addFavoriteProject({ userId, project, }) {
        const insertedProject = await this.db(T.FAVORITE_PROJECTS)
            .insert({ project, user_id: userId })
            .onConflict(['user_id', 'project'])
            .merge()
            .returning('*');
        return rowToFavorite(insertedProject[0]);
    }
    async delete({ userId, project }) {
        return this.db(T.FAVORITE_PROJECTS)
            .where({ project, user_id: userId })
            .del();
    }
    async deleteAll() {
        await this.db(T.FAVORITE_PROJECTS).del();
    }
    destroy() { }
    async exists({ userId, project }) {
        const result = await this.db.raw(`SELECT EXISTS(SELECT 1 FROM ${T.FAVORITE_PROJECTS} WHERE user_id = ? AND project = ?) AS present`, [userId, project]);
        const { present } = result.rows[0];
        return present;
    }
    async get({ userId, project, }) {
        const favorite = await this.db
            .table(T.FAVORITE_PROJECTS)
            .select()
            .where({ project, user_id: userId })
            .first();
        return rowToFavorite(favorite);
    }
    async getAll() {
        const groups = await this.db(T.FAVORITE_PROJECTS).select();
        return groups.map(rowToFavorite);
    }
}
exports.FavoriteProjectsStore = FavoriteProjectsStore;
//# sourceMappingURL=favorite-projects-store.js.map