"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notfound_error_1 = __importDefault(require("../error/notfound-error"));
const STRATEGY_COLUMNS = [
    'title',
    'name',
    'description',
    'parameters',
    'built_in',
    'deprecated',
    'display_name',
];
const TABLE = 'strategies';
class StrategyStore {
    constructor(db, getLogger) {
        this.db = db;
        this.logger = getLogger('strategy-store.ts');
    }
    async getAll() {
        const rows = await this.db
            .select(STRATEGY_COLUMNS)
            .from(TABLE)
            .orderBy('sort_order', 'asc')
            .orderBy('name', 'asc');
        return rows.map(this.rowToStrategy);
    }
    async getEditableStrategies() {
        const rows = await this.db
            .select(STRATEGY_COLUMNS)
            .from(TABLE)
            .where({ built_in: 0 }) // eslint-disable-line
            .orderBy('sort_order', 'asc')
            .orderBy('name', 'asc');
        return rows.map(this.rowToEditableStrategy);
    }
    async getStrategy(name) {
        return this.db
            .first(STRATEGY_COLUMNS)
            .from(TABLE)
            .where({ name })
            .then(this.rowToStrategy);
    }
    async delete(name) {
        await this.db(TABLE).where({ name }).del();
    }
    async deleteAll() {
        await this.db(TABLE).del();
    }
    async count() {
        return this.db
            .from(TABLE)
            .count('*')
            .then((res) => Number(res[0].count));
    }
    destroy() { }
    async exists(name) {
        const result = await this.db.raw(`SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE name = ?) AS present`, [name]);
        const { present } = result.rows[0];
        return present;
    }
    async get(name) {
        const row = await this.db(TABLE).where({ name }).first();
        return this.rowToStrategy(row);
    }
    rowToStrategy(row) {
        if (!row) {
            throw new notfound_error_1.default('No strategy found');
        }
        return {
            displayName: row.display_name,
            name: row.name,
            editable: row.built_in !== 1,
            description: row.description,
            parameters: row.parameters,
            deprecated: row.deprecated,
            title: row.title,
        };
    }
    rowToEditableStrategy(row) {
        if (!row) {
            throw new notfound_error_1.default('No strategy found');
        }
        return {
            name: row.name,
            description: row.description,
            parameters: row.parameters,
            deprecated: row.deprecated,
            title: row.title,
        };
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    eventDataToRow(data) {
        return {
            name: data.name,
            description: data.description,
            parameters: JSON.stringify(data.parameters),
            title: data.title,
        };
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async createStrategy(data) {
        await this.db(TABLE).insert(this.eventDataToRow(data));
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async updateStrategy(data) {
        await this.db(TABLE)
            .where({ name: data.name })
            .update(this.eventDataToRow(data));
    }
    async deprecateStrategy({ name }) {
        await this.db(TABLE).where({ name }).update({ deprecated: true });
    }
    async reactivateStrategy({ name }) {
        await this.db(TABLE).where({ name }).update({ deprecated: false });
    }
    async deleteStrategy({ name }) {
        await this.db(TABLE).where({ name }).del();
    }
    async importStrategy(data) {
        const rowData = {
            name: data.name,
            description: data.description,
            deprecated: data.deprecated || false,
            parameters: JSON.stringify(data.parameters || []),
            built_in: data.builtIn ? 1 : 0,
            sort_order: data.sortOrder || 9999,
            display_name: data.displayName,
            title: data.title,
        };
        await this.db(TABLE).insert(rowData).onConflict(['name']).merge();
    }
    async dropCustomStrategies() {
        await this.db(TABLE)
            .where({ built_in: 0 }) // eslint-disable-line
            .delete();
    }
}
exports.default = StrategyStore;
module.exports = StrategyStore;
//# sourceMappingURL=strategy-store.js.map