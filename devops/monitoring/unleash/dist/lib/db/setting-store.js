"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TABLE = 'settings';
class SettingStore {
    constructor(db, getLogger) {
        this.db = db;
        this.logger = getLogger('settings-store.ts');
    }
    async postgresVersion() {
        try {
            const showResult = await this.db.raw('SHOW server_version');
            return showResult?.rows[0]?.server_version || '';
        }
        catch (e) {
            this.logger.warn('Failed to fetch postgres version', e);
            return '';
        }
    }
    async updateRow(name, content) {
        return this.db(TABLE)
            .where('name', name)
            .update({
            content: JSON.stringify(content),
        });
    }
    async exists(name) {
        const result = await this.db.raw(`SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE name = ?) AS present`, [name]);
        const { present } = result.rows[0];
        return present;
    }
    async get(name) {
        const result = await this.db
            .select()
            .from(TABLE)
            .where('name', name)
            .limit(1);
        if (result.length > 0) {
            return result[0].content;
        }
        return undefined;
    }
    // Is actually an upsert
    async insert(name, content) {
        await this.db(TABLE)
            .insert({ name, content })
            .onConflict('name')
            .merge();
    }
    async delete(name) {
        await this.db(TABLE).where({ name }).del();
    }
    async deleteAll() {
        await this.db(TABLE).del();
    }
    destroy() { }
    async getAll() {
        const rows = await this.db(TABLE).select();
        return rows.map((r) => r.content);
    }
}
exports.default = SettingStore;
module.exports = SettingStore;
//# sourceMappingURL=setting-store.js.map