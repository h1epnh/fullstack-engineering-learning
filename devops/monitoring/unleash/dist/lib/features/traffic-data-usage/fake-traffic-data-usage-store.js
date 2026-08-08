"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeTrafficDataUsageStore = void 0;
const date_fns_1 = require("date-fns");
class FakeTrafficDataUsageStore {
    constructor() {
        this.trafficData = [];
    }
    get(key) {
        throw new Error('Method not implemented.');
    }
    getAll(query) {
        throw new Error('Method not implemented.');
    }
    exists(key) {
        throw new Error('Method not implemented.');
    }
    delete(key) {
        throw new Error('Method not implemented.');
    }
    deleteAll() {
        throw new Error('Method not implemented.');
    }
    destroy() {
        throw new Error('Method not implemented.');
    }
    async upsert(trafficDataUsage) {
        const index = this.trafficData.findIndex((data) => data.day.getTime() === trafficDataUsage.day.getTime() &&
            data.trafficGroup === trafficDataUsage.trafficGroup &&
            data.statusCodeSeries === trafficDataUsage.statusCodeSeries);
        if (index >= 0) {
            this.trafficData[index].count += trafficDataUsage.count;
        }
        else {
            this.trafficData.push(trafficDataUsage);
        }
    }
    async getTrafficDataUsageForPeriod(period) {
        const periodDate = (0, date_fns_1.parse)(period, 'yyyy-MM', new Date());
        return this.trafficData.filter((data) => (0, date_fns_1.isSameMonth)(data.day, periodDate));
    }
    async getTrafficDataForMonthRange(monthsBack) {
        const now = new Date();
        const data = this.trafficData
            .filter((entry) => (0, date_fns_1.differenceInCalendarMonths)(now, entry.day) <=
            monthsBack)
            .reduce((acc, entry) => {
            const month = (0, date_fns_1.format)(entry.day, 'yyyy-MM');
            const key = `${month}-${entry.trafficGroup}-${entry.statusCodeSeries}`;
            if (acc[key]) {
                acc[key].count += entry.count;
            }
            else {
                acc[key] = {
                    month,
                    trafficGroup: entry.trafficGroup,
                    statusCodeSeries: entry.statusCodeSeries,
                    count: entry.count,
                };
            }
            return acc;
        }, {});
        return Object.values(data);
    }
    async getDailyTrafficDataUsageForPeriod(from, to) {
        return this.trafficData.filter((data) => data.day >= (0, date_fns_1.startOfDay)(from) && data.day <= (0, date_fns_1.endOfDay)(to));
    }
    async getMonthlyTrafficDataUsageForPeriod(from, to) {
        const data = this.trafficData
            .filter((data) => data.day >= (0, date_fns_1.startOfDay)(from) &&
            data.day <= (0, date_fns_1.endOfDay)(to))
            .reduce((acc, entry) => {
            const month = (0, date_fns_1.format)(entry.day, 'yyyy-MM');
            const key = `${month}-${entry.trafficGroup}-${entry.statusCodeSeries}`;
            if (acc[key]) {
                acc[key].count += entry.count;
            }
            else {
                acc[key] = {
                    month,
                    trafficGroup: entry.trafficGroup,
                    statusCodeSeries: entry.statusCodeSeries,
                    count: entry.count,
                };
            }
            return acc;
        }, {});
        return Object.values(data);
    }
}
exports.FakeTrafficDataUsageStore = FakeTrafficDataUsageStore;
//# sourceMappingURL=fake-traffic-data-usage-store.js.map