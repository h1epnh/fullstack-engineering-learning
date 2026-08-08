"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRUDStore = void 0;
const error_1 = require("../../error");
const metric_events_1 = require("../../metric-events");
const metrics_helper_1 = __importDefault(require("../../util/metrics-helper"));
const default_mappings_1 = require("./default-mappings");
/**
 * This abstract class defines the basic operations for a CRUD store.
 *
 * It accepts one model as input and one model as output that generally includes auto-generated properties such as the id or createdAt.
 *
 * Provides default types for:
 * - OutputRowModel turning the properties of OutputModel from camelCase to snake_case
 * - InputRowModel turning the properties of InputModel from camelCase to snake_case
 * - IdType assumming it's a number
 *
 * These types can be overridden to suit different needs.
 *
 * Default implementations of toRow and fromRow are provided, but can be overridden.
 */
class CRUDStore {
    constructor(tableName, db, { eventBus }, options) {
        this.tableName = tableName;
        this.db = db;
        this.timer = (action) => metrics_helper_1.default.wrapTimer(eventBus, metric_events_1.DB_TIME, {
            store: tableName,
            action,
        });
        this.toRow = options?.toRow ?? (default_mappings_1.defaultToRow);
        this.fromRow =
            options?.fromRow ?? (default_mappings_1.defaultFromRow);
    }
    async getAll(query) {
        const endTimer = this.timer('getAll');
        let allQuery = this.db(this.tableName);
        if (query) {
            allQuery = allQuery.where(this.toRow(query));
        }
        const items = await allQuery;
        endTimer();
        return items.map(this.fromRow);
    }
    async insert(item) {
        const rows = await this.db(this.tableName)
            .insert(this.toRow(item))
            .returning('*');
        return this.fromRow(rows[0]);
    }
    async bulkInsert(items) {
        if (!items || items.length === 0) {
            return [];
        }
        const endTimer = this.timer('bulkInsert');
        const rows = await this.db(this.tableName)
            .insert(items.map(this.toRow))
            .returning('*');
        endTimer();
        return rows.map(this.fromRow);
    }
    async update(id, item) {
        const rows = await this.db(this.tableName)
            .where({ id })
            .update(this.toRow(item))
            .returning('*');
        return this.fromRow(rows[0]);
    }
    async delete(id) {
        return this.db(this.tableName).where({ id }).delete();
    }
    async deleteAll() {
        return this.db(this.tableName).delete();
    }
    destroy() { }
    async exists(id) {
        const endTimer = this.timer('exists');
        const result = await this.db.raw(`SELECT EXISTS(SELECT 1 FROM ${this.tableName} WHERE id = ?) AS present`, [id]);
        const { present } = result.rows[0];
        endTimer();
        return present;
    }
    async count(query) {
        const endTimer = this.timer('count');
        let countQuery = this.db(this.tableName).count('*');
        if (query) {
            countQuery = countQuery.where(this.toRow(query));
        }
        const { count } = (await countQuery.first()) ?? { count: 0 };
        endTimer();
        return Number(count);
    }
    async get(id) {
        const endTimer = this.timer('get');
        const row = await this.db(this.tableName).where({ id }).first();
        endTimer();
        if (!row) {
            throw new error_1.NotFoundError(`No item with id ${id}`);
        }
        return this.fromRow(row);
    }
}
exports.CRUDStore = CRUDStore;
//# sourceMappingURL=crud-store.js.map