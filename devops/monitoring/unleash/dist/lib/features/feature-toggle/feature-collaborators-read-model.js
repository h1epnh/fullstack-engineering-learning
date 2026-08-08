"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureCollaboratorsReadModel = void 0;
const util_1 = require("../../util");
class FeatureCollaboratorsReadModel {
    constructor(db) {
        this.db = db;
    }
    async getFeatureCollaborators(feature) {
        const query = this.db
            .with('recent_events', (queryBuilder) => {
            queryBuilder
                .select('created_by_user_id')
                .max('created_at as max_created_at')
                .from('events')
                .where('feature_name', feature)
                .groupBy('created_by_user_id');
        })
            .select('users.id', 'users.email', 'users.username', 'users.name')
            .from('recent_events')
            .join('users', 'recent_events.created_by_user_id', 'users.id')
            .orderBy('recent_events.max_created_at', 'desc');
        const rows = await query;
        return rows.map((row) => {
            const name = row.name || row.username || row.email || 'unknown';
            return {
                id: row.id,
                name: name,
                imageUrl: (0, util_1.generateImageUrl)({
                    id: row.id,
                    email: row.email,
                    username: name,
                }),
            };
        });
    }
}
exports.FeatureCollaboratorsReadModel = FeatureCollaboratorsReadModel;
//# sourceMappingURL=feature-collaborators-read-model.js.map