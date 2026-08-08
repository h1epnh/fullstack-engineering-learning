"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const COLUMNS = ['id', 'name', 'description', 'lifetime_days'];
const TABLE = 'feature_types';
class FeatureTypeStore {
    constructor(db, getLogger) {
        this.db = db;
        this.logger = getLogger('feature-type-store.ts');
    }
    async getAll() {
        const rows = await this.db.select(COLUMNS).from(TABLE);
        return rows.map(this.rowToFeatureType);
    }
    rowToFeatureType(row) {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            lifetimeDays: row.lifetime_days,
        };
    }
    async get(id) {
        const row = await this.db(TABLE).where({ id }).first();
        return row ? this.rowToFeatureType(row) : row;
    }
    async getByName(name) {
        const row = await this.db(TABLE).where({ name }).first();
        return this.rowToFeatureType(row);
    }
    async delete(key) {
        await this.db(TABLE).where({ id: key }).del();
    }
    async deleteAll() {
        await this.db(TABLE).del();
    }
    destroy() { }
    async exists(key) {
        const result = await this.db.raw(`SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE id = ?) AS present`, [key]);
        const { present } = result.rows[0];
        return present;
    }
    async updateLifetime(id, newLifetimeDays) {
        const [updatedType] = await this.db(TABLE)
            .update({ lifetime_days: newLifetimeDays })
            .where({ id })
            .returning(['*']);
        if (updatedType) {
            return this.rowToFeatureType(updatedType);
        }
        else {
            return undefined;
        }
    }
}
exports.default = FeatureTypeStore;
module.exports = FeatureTypeStore;
//# sourceMappingURL=feature-type-store.js.map