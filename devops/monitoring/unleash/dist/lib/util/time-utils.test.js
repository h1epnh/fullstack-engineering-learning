"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const time_utils_1 = require("./time-utils");
const date_fns_1 = require("date-fns");
test('generateHourBuckets', () => {
    const result = (0, time_utils_1.generateHourBuckets)(24);
    expect(result).toHaveLength(24);
});
test('generateDayBuckets', () => {
    const result = (0, time_utils_1.generateDayBuckets)(7);
    const endOfDayYesterday = (0, date_fns_1.endOfDay)((0, date_fns_1.subDays)(new Date(), 1));
    expect(result).toHaveLength(7);
    expect(result[0]).toMatchObject({ timestamp: endOfDayYesterday });
});
//# sourceMappingURL=time-utils.test.js.map