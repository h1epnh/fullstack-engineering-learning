"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spreadVariants = exports.collapseHourlyMetrics = void 0;
const date_fns_1 = require("date-fns");
const createMetricKey = (metric) => {
    return [
        metric.featureName,
        metric.appName,
        metric.environment,
        metric.timestamp.getTime(),
    ].join();
};
const mergeRecords = (firstRecord, secondRecord) => {
    const result = {};
    for (const key in firstRecord) {
        result[key] = firstRecord[key] + (secondRecord[key] ?? 0);
    }
    for (const key in secondRecord) {
        if (!(key in result)) {
            result[key] = secondRecord[key];
        }
    }
    return result;
};
const collapseHourlyMetrics = (metrics) => {
    const grouped = new Map();
    metrics.forEach((metric) => {
        const hourlyMetric = {
            ...metric,
            timestamp: (0, date_fns_1.startOfHour)(metric.timestamp),
        };
        const key = createMetricKey(hourlyMetric);
        if (!grouped[key]) {
            grouped[key] = hourlyMetric;
        }
        else {
            grouped[key].yes = metric.yes + (grouped[key].yes || 0);
            grouped[key].no = metric.no + (grouped[key].no || 0);
            if (metric.variants) {
                grouped[key].variants = mergeRecords(metric.variants, grouped[key].variants ?? {});
            }
        }
    });
    return Object.values(grouped);
};
exports.collapseHourlyMetrics = collapseHourlyMetrics;
const spreadVariants = (metrics) => {
    return metrics.flatMap((item) => {
        if (!item.variants) {
            return [];
        }
        return Object.entries(item.variants).map(([variant, count]) => ({
            featureName: item.featureName,
            appName: item.appName,
            environment: item.environment,
            timestamp: item.timestamp,
            variant,
            count,
        }));
    });
};
exports.spreadVariants = spreadVariants;
//# sourceMappingURL=collapseHourlyMetrics.js.map