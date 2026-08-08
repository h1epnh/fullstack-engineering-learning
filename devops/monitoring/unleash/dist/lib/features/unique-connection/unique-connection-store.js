"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniqueConnectionStore = void 0;
class UniqueConnectionStore {
    constructor(db) {
        this.db = db;
    }
    async insert(uniqueConnections) {
        await this.db('unique_connections')
            .insert({
            id: uniqueConnections.id,
            hll: uniqueConnections.hll,
            updated_at: this.db.raw('DEFAULT'),
        })
            .onConflict('id')
            .merge();
    }
    async get(id) {
        const row = await this.db('unique_connections')
            .select('id', 'hll', 'updated_at')
            .where('id', id)
            .first();
        return row
            ? { id: row.id, hll: row.hll, updatedAt: row.updated_at }
            : null;
    }
    async deleteAll() {
        await this.db('unique_connections').delete();
    }
}
exports.UniqueConnectionStore = UniqueConnectionStore;
//# sourceMappingURL=unique-connection-store.js.map