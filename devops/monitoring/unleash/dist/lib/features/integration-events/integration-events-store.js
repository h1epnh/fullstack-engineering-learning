"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationEventsStore = void 0;
const crud_store_1 = require("../../db/crud/crud-store");
class IntegrationEventsStore extends crud_store_1.CRUDStore {
    constructor(db, config) {
        super('integration_events', db, config);
    }
    async getPaginatedEvents(id, limit, offset) {
        const endTimer = this.timer('getPaginatedEvents');
        const rows = await this.db(this.tableName)
            .where('integration_id', id)
            .limit(limit)
            .offset(offset)
            .orderBy('id', 'desc');
        endTimer();
        return rows.map(this.fromRow);
    }
    async cleanUpEvents() {
        const endTimer = this.timer('cleanUpEvents');
        await this.db
            .with('latest_events', (qb) => {
            qb.select('id')
                .from(this.tableName)
                .whereRaw(`created_at >= now() - INTERVAL '2 hours'`)
                .orderBy('id', 'desc')
                .limit(100);
        })
            .with('latest_per_integration', (qb) => {
            qb.select(this.db.raw('MAX(id) as id'))
                .from(this.tableName)
                .groupBy('integration_id');
        })
            .from(this.tableName)
            .whereNotIn('id', this.db
            .select('id')
            .from('latest_events')
            .union(this.db.select('id').from('latest_per_integration')))
            .delete();
        endTimer();
    }
}
exports.IntegrationEventsStore = IntegrationEventsStore;
//# sourceMappingURL=integration-events-store.js.map