"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LastSeenAtReadModel = void 0;
const TABLE = 'last_seen_at_metrics';
class LastSeenAtReadModel {
    constructor(db) {
        this.db = db;
    }
    async getForFeature(features) {
        const rows = await this.db(TABLE).whereIn('feature_name', features);
        const result = rows.reduce((acc, curr) => {
            if (!acc[curr.feature_name]) {
                acc[curr.feature_name] = {};
                acc[curr.feature_name][curr.environment] = {
                    lastSeen: curr.last_seen_at,
                };
            }
            else {
                acc[curr.feature_name][curr.environment] = {
                    lastSeen: curr.last_seen_at,
                };
            }
            return acc;
        }, {});
        return result;
    }
}
exports.LastSeenAtReadModel = LastSeenAtReadModel;
//# sourceMappingURL=last-seen-read-model.js.map