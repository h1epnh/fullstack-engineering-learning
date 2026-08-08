"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobStore = void 0;
const metrics_helper_1 = __importDefault(require("../../util/metrics-helper"));
const metric_events_1 = require("../../metric-events");
const default_mappings_1 = require("../../db/crud/default-mappings");
const TABLE = 'jobs';
const toRow = (data) => (0, default_mappings_1.defaultToRow)(data);
class JobStore {
    constructor(db, config) {
        this.db = db;
        this.logger = config.getLogger('job-store');
        this.timer = (action) => metrics_helper_1.default.wrapTimer(config.eventBus, metric_events_1.DB_TIME, {
            store: TABLE,
            action,
        });
    }
    async acquireBucket(key, bucketLengthInMinutes) {
        const endTimer = this.timer('acquireBucket');
        const bucket = await this.db(TABLE)
            .insert({
            name: key,
            // note: date_floor_round is a custom function defined in the DB
            bucket: this.db.raw(`date_floor_round(now(), '${bucketLengthInMinutes} minutes')`),
            stage: 'started',
        })
            .onConflict(['name', 'bucket'])
            .ignore()
            .returning(['name', 'bucket']);
        endTimer();
        return bucket[0];
    }
    async update(name, bucket, data) {
        const rows = await this.db(TABLE)
            .update(toRow(data))
            .where({ name, bucket })
            .returning('*');
        return rows[0];
    }
    async get(pk) {
        const rows = await this.db(TABLE).where(pk);
        return rows[0];
    }
    async getAll(query) {
        if (query) {
            return this.db(TABLE).where(query);
        }
        return this.db(TABLE);
    }
    async exists(key) {
        const result = await this.db.raw(`SELECT EXISTS(SELECT 1 FROM ${TABLE} WHERE name = ? AND bucket = ?) AS present`, [key.name, key.bucket]);
        const { present } = result.rows[0];
        return present;
    }
    async delete(key) {
        await this.db(TABLE).where(key).delete();
    }
    async deleteAll() {
        return this.db(TABLE).delete();
    }
    destroy() { }
    async count() {
        return this.db(TABLE)
            .count()
            .then((res) => Number(res[0].count));
    }
}
exports.JobStore = JobStore;
//# sourceMappingURL=job-store.js.map