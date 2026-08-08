"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrafficDataUsageStore = void 0;
const date_fns_1 = require("date-fns");
const TABLE = 'stat_traffic_usage';
const COLUMNS = ['day', 'traffic_group', 'status_code_series', 'count'];
const toRow = (trafficDataUsage) => {
    return {
        day: trafficDataUsage.day,
        traffic_group: trafficDataUsage.trafficGroup,
        status_code_series: trafficDataUsage.statusCodeSeries,
        count: trafficDataUsage.count,
    };
};
const mapRow = (row) => {
    return {
        day: row.day,
        trafficGroup: row.traffic_group,
        statusCodeSeries: row.status_code_series,
        count: Number.parseInt(row.count),
    };
};
class TrafficDataUsageStore {
    constructor(db, getLogger) {
        this.db = db;
        this.logger = getLogger('traffic-data-usage-store.ts');
    }
    async get(key) {
        const row = await this.db
            .table(TABLE)
            .select()
            .where({
            day: key.day,
            traffic_group: key.trafficGroup,
            status_code_series: key.statusCodeSeries,
        })
            .first();
        return mapRow(row);
    }
    async getAll(query = {}) {
        const rows = await this.db.select(COLUMNS).where(query).from(TABLE);
        return rows.map(mapRow);
    }
    async exists(key) {
        const result = await this.db.raw(`SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE
                day = ? AND
                traffic_group = ? AND
                status_code_series ?) AS present`, [key.day, key.trafficGroup, key.statusCodeSeries]);
        const { present } = result.rows[0];
        return present;
    }
    async delete(key) {
        await this.db(TABLE)
            .where({
            day: key.day,
            traffic_group: key.trafficGroup,
            status_code_series: key.statusCodeSeries,
        })
            .del();
    }
    async deleteAll() {
        await this.db(TABLE).del();
    }
    destroy() { }
    async upsert(trafficDataUsage) {
        const row = toRow(trafficDataUsage);
        await this.db(TABLE)
            .insert(row)
            .onConflict(['day', 'traffic_group', 'status_code_series'])
            .merge({
            count: this.db.raw('stat_traffic_usage.count + EXCLUDED.count'),
        });
    }
    async getDailyTrafficDataUsageForPeriod(from, to) {
        const rows = await this.db(TABLE)
            .where('day', '>=', (0, date_fns_1.startOfDay)(from))
            .andWhere('day', '<=', (0, date_fns_1.endOfDay)(to));
        return rows.map(mapRow);
    }
    async getMonthlyTrafficDataUsageForPeriod(from, to) {
        const rows = await this.db(TABLE)
            .select('traffic_group', 'status_code_series', this.db.raw(`to_char(day, 'YYYY-MM') AS month`), this.db.raw(`SUM(count) AS count`))
            .where('day', '>=', (0, date_fns_1.startOfDay)(from))
            .andWhere('day', '<=', (0, date_fns_1.endOfDay)(to))
            .groupBy([
            'traffic_group',
            this.db.raw(`to_char(day, 'YYYY-MM')`),
            'status_code_series',
        ])
            .orderBy([
            { column: 'month', order: 'desc' },
            { column: 'traffic_group', order: 'asc' },
        ]);
        return rows.map(({ traffic_group, status_code_series, month, count }) => ({
            trafficGroup: traffic_group,
            statusCodeSeries: status_code_series,
            month,
            count: Number.parseInt(count),
        }));
    }
    async getTrafficDataUsageForPeriod(period) {
        const month = new Date(period);
        return this.getDailyTrafficDataUsageForPeriod((0, date_fns_1.startOfMonth)(month), (0, date_fns_1.endOfMonth)(month));
    }
}
exports.TrafficDataUsageStore = TrafficDataUsageStore;
//# sourceMappingURL=traffic-data-usage-store.js.map