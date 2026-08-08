"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const metric_events_1 = require("../metric-events");
const metrics_helper_1 = __importDefault(require("../util/metrics-helper"));
const notfound_error_1 = __importDefault(require("../error/notfound-error"));
const COLUMNS = ['type', 'value'];
const TABLE = 'tags';
class TagStore {
    constructor(db, eventBus, getLogger) {
        this.db = db;
        this.logger = getLogger('tag-store.ts');
        this.timer = (action) => metrics_helper_1.default.wrapTimer(eventBus, metric_events_1.DB_TIME, {
            store: 'tag',
            action,
        });
    }
    async getTagsByType(type) {
        const stopTimer = this.timer('getTagByType');
        const rows = await this.db.select(COLUMNS).from(TABLE).where({ type });
        stopTimer();
        return rows.map(this.rowToTag);
    }
    async getAll() {
        const stopTimer = this.timer('getAll');
        const rows = await this.db.select(COLUMNS).from(TABLE);
        stopTimer();
        return rows.map(this.rowToTag);
    }
    async getTag(type, value) {
        const stopTimer = this.timer('getTag');
        const tag = await this.db
            .first(COLUMNS)
            .from(TABLE)
            .where({ type, value });
        stopTimer();
        if (!tag) {
            throw new notfound_error_1.default(`No tag with type: [${type}] and value [${value}]`);
        }
        return tag;
    }
    async exists(tag) {
        const stopTimer = this.timer('exists');
        const result = await this.db.raw(`SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE type = ? AND value = ?) AS present`, [tag.type, tag.value]);
        const { present } = result.rows[0];
        stopTimer();
        return present;
    }
    async createTag(tag) {
        const stopTimer = this.timer('createTag');
        await this.db(TABLE).insert(tag);
        stopTimer();
    }
    async delete(tag) {
        const stopTimer = this.timer('deleteTag');
        await this.db(TABLE).where(tag).del();
        stopTimer();
    }
    async deleteAll() {
        const stopTimer = this.timer('deleteAll');
        await this.db(TABLE).del();
        stopTimer();
    }
    async bulkImport(tags) {
        return this.db(TABLE)
            .insert(tags)
            .returning(COLUMNS)
            .onConflict(['type', 'value'])
            .ignore();
    }
    destroy() { }
    async get({ type, value }) {
        const stopTimer = this.timer('getTag');
        const tag = await this.db
            .first(COLUMNS)
            .from(TABLE)
            .where({ type, value });
        stopTimer();
        if (!tag) {
            throw new notfound_error_1.default(`No tag with type: [${type}] and value [${value}]`);
        }
        return tag;
    }
    rowToTag(row) {
        return {
            type: row.type,
            value: row.value,
        };
    }
}
exports.default = TagStore;
module.exports = TagStore;
//# sourceMappingURL=tag-store.js.map