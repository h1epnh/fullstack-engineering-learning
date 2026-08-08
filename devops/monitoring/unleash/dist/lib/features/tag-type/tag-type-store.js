"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const metric_events_1 = require("../../metric-events");
const metrics_helper_1 = __importDefault(require("../../util/metrics-helper"));
const notfound_error_1 = __importDefault(require("../../error/notfound-error"));
const COLUMNS = ['name', 'description', 'icon', 'color'];
const TABLE = 'tag_types';
class TagTypeStore {
    constructor(db, eventBus, getLogger) {
        this.db = db;
        this.logger = getLogger('tag-type-store.ts');
        this.timer = (action) => metrics_helper_1.default.wrapTimer(eventBus, metric_events_1.DB_TIME, {
            store: 'tag-type',
            action,
        });
    }
    async getAll() {
        const stopTimer = this.timer('getTagTypes');
        const rows = await this.db.select(COLUMNS).from(TABLE);
        stopTimer();
        return rows.map(this.rowToTagType);
    }
    async get(name) {
        const stopTimer = this.timer('getTagTypeByName');
        return this.db
            .first(COLUMNS)
            .from(TABLE)
            .where({ name })
            .then((row) => {
            stopTimer();
            if (!row) {
                throw new notfound_error_1.default('Could not find tag-type');
            }
            else {
                return this.rowToTagType(row);
            }
        });
    }
    async exists(name) {
        const stopTimer = this.timer('exists');
        const result = await this.db.raw(`SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE name = ?) AS present`, [name]);
        const { present } = result.rows[0];
        stopTimer();
        return present;
    }
    async createTagType(newTagType) {
        const stopTimer = this.timer('createTagType');
        await this.db(TABLE).insert(newTagType);
        stopTimer();
    }
    async delete(name) {
        const stopTimer = this.timer('deleteTagType');
        await this.db(TABLE).where({ name }).del();
        stopTimer();
    }
    async deleteAll() {
        const stopTimer = this.timer('deleteAll');
        await this.db(TABLE).del();
        stopTimer();
    }
    async bulkImport(tagTypes) {
        const rows = await this.db(TABLE)
            .insert(tagTypes)
            .returning(COLUMNS)
            .onConflict('name')
            .ignore();
        if (rows.length > 0) {
            return rows;
        }
        return [];
    }
    async updateTagType({ name, description, icon, color, }) {
        const stopTimer = this.timer('updateTagType');
        await this.db(TABLE)
            .where({ name })
            .update({ description, icon, color });
        stopTimer();
    }
    destroy() { }
    rowToTagType(row) {
        return {
            name: row.name,
            description: row.description,
            icon: row.icon,
            color: row.color,
        };
    }
}
exports.default = TagTypeStore;
module.exports = TagTypeStore;
//# sourceMappingURL=tag-type-store.js.map