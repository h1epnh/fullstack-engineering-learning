"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const metric_events_1 = require("../../../metric-events");
const metrics_helper_1 = __importDefault(require("../../../util/metrics-helper"));
const TABLE = 'last_seen_at_metrics';
const prepareLastSeenInput = (data) => {
    const now = new Date();
    const sortedData = data.sort((a, b) => a.featureName.localeCompare(b.featureName) ||
        a.environment.localeCompare(b.environment));
    const inserts = sortedData.map((item) => {
        return {
            feature_name: item.featureName,
            environment: item.environment,
            last_seen_at: now,
        };
    });
    return inserts;
};
class LastSeenStore {
    constructor(db, eventBus, getLogger) {
        this.db = db;
        this.logger = getLogger('last-seen-store.ts');
        this.timer = (action) => metrics_helper_1.default.wrapTimer(eventBus, metric_events_1.DB_TIME, {
            store: 'last-seen-environment-store',
            action,
        });
    }
    async setLastSeen(data) {
        try {
            const inserts = prepareLastSeenInput(data);
            const batchSize = 500;
            for (let i = 0; i < inserts.length; i += batchSize) {
                const batch = inserts.slice(i, i + batchSize);
                // Knex optimizes multi row insert when given an array:
                // https://knexjs.org/guide/query-builder.html#insert
                await this.db(TABLE)
                    .insert(batch)
                    .onConflict(['feature_name', 'environment'])
                    .merge();
            }
        }
        catch (err) {
            this.logger.error('Could not update lastSeen, error: ', err);
        }
    }
    async cleanLastSeen() {
        await this.db(TABLE)
            .whereNotIn('feature_name', this.db.select('name').from('features'))
            .or.whereNotIn('environment', this.db.select('name').from('environments'))
            .del();
    }
}
exports.default = LastSeenStore;
module.exports = LastSeenStore;
//# sourceMappingURL=last-seen-store.js.map