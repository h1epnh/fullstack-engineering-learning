"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHourBuckets = generateHourBuckets;
exports.generateDayBuckets = generateDayBuckets;
const date_fns_1 = require("date-fns");
function generateHourBuckets(hours) {
    const start = (0, date_fns_1.startOfHour)(new Date());
    const result = [];
    for (let i = 0; i < hours; i++) {
        result.push({ timestamp: (0, date_fns_1.subHours)(start, i) });
    }
    return result;
}
// Generate last x days starting from end of yesterday
function generateDayBuckets(days) {
    const start = (0, date_fns_1.endOfDay)((0, date_fns_1.subDays)(new Date(), 1));
    const result = [];
    for (let i = 0; i < days; i++) {
        result.push({ timestamp: (0, date_fns_1.subDays)(start, i) });
    }
    return result;
}
//# sourceMappingURL=time-utils.js.map